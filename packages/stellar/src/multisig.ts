import {
  Horizon,
  Keypair,
  TransactionBuilder,
  Operation,
  BASE_FEE,
} from 'stellar-sdk';
import { StellarConfig } from './config';

/**
 * Multi-signature helpers for high-value disbursements. BayanFi configures
 * a distribution account with multiple signers and a threshold so that
 * transactions above a policy limit require N-of-M approvals.
 */
export class MultisigManager {
  private readonly server: Horizon.Server;

  constructor(private readonly config: StellarConfig) {
    this.server = new Horizon.Server(config.horizonUrl);
  }

  /**
   * Configures an account for multi-sig: adds signer(s) and sets thresholds.
   * masterWeight/low/med/high define how many signature weights are needed.
   */
  async setupMultisig(params: {
    accountSecret: string;
    additionalSigners: string[]; // public keys
    signerWeight?: number;
    thresholds?: { low: number; medium: number; high: number };
    masterWeight?: number;
  }): Promise<string> {
    const kp = Keypair.fromSecret(params.accountSecret);
    const account = await this.server.loadAccount(kp.publicKey());
    const builder = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.config.networkPassphrase,
    });

    for (const signer of params.additionalSigners) {
      builder.addOperation(
        Operation.setOptions({
          signer: { ed25519PublicKey: signer, weight: params.signerWeight ?? 1 },
        })
      );
    }

    builder.addOperation(
      Operation.setOptions({
        masterWeight: params.masterWeight ?? 1,
        lowThreshold: params.thresholds?.low ?? 1,
        medThreshold: params.thresholds?.medium ?? 2,
        highThreshold: params.thresholds?.high ?? 2,
      })
    );

    const tx = builder.setTimeout(120).build();
    tx.sign(kp);
    const res: any = await this.server.submitTransaction(tx);
    return res.hash;
  }

  /**
   * Builds an unsigned transaction envelope (XDR) for a payment that
   * requires multiple signatures. Signers collect signatures out of band,
   * then submit via submitSigned().
   */
  async buildPaymentEnvelope(params: {
    sourcePublic: string;
    destination: string;
    amount: string;
    assetCode: string;
    assetIssuer?: string;
  }): Promise<string> {
    const { Asset, Operation: Op } = await import('stellar-sdk');
    const account = await this.server.loadAccount(params.sourcePublic);
    const asset =
      params.assetCode === 'XLM'
        ? Asset.native()
        : new Asset(params.assetCode, params.assetIssuer!);
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.config.networkPassphrase,
    })
      .addOperation(Op.payment({ destination: params.destination, asset, amount: params.amount }))
      .setTimeout(300)
      .build();
    return tx.toXDR();
  }

  /** Adds a signature to an XDR-encoded transaction. */
  signEnvelope(xdr: string, signerSecret: string): string {
    const tx = TransactionBuilder.fromXDR(xdr, this.config.networkPassphrase);
    tx.sign(Keypair.fromSecret(signerSecret));
    return tx.toXDR();
  }

  /** Submits a fully-signed XDR transaction. */
  async submitSigned(xdr: string): Promise<string> {
    const tx = TransactionBuilder.fromXDR(xdr, this.config.networkPassphrase);
    const res: any = await this.server.submitTransaction(tx);
    return res.hash;
  }
}
