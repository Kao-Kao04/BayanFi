import {
  Horizon,
  Keypair,
  TransactionBuilder,
  Operation,
  Asset,
  Memo,
  BASE_FEE,
  Claimant,
} from 'stellar-sdk';
import { StellarConfig, getUsdcIssuer } from './config';

export interface PaymentParams {
  sourceSecret: string;
  destination: string;
  amount: string;
  asset: Asset;
  memo?: string;
}

export interface BalanceLine {
  asset: string;
  issuer?: string;
  balance: string;
}

export interface SubmitResult {
  hash: string;
  ledger: number;
  successful: boolean;
}

/**
 * StellarClient is a thin, testable wrapper over Horizon that encapsulates
 * the common operations BayanFi needs: funding, trustlines, payments,
 * balance queries, and asset construction.
 */
export class StellarClient {
  private readonly server: Horizon.Server;

  constructor(private readonly config: StellarConfig) {
    this.server = new Horizon.Server(config.horizonUrl);
  }

  /** Returns the USDC Asset for the configured network. */
  usdc(): Asset {
    return new Asset('USDC', getUsdcIssuer(this.config.network));
  }

  /** Returns the native XLM asset. */
  native(): Asset {
    return Asset.native();
  }

  /** Builds a custom program asset issued by the given issuer. */
  customAsset(code: string, issuer: string): Asset {
    return new Asset(code, issuer);
  }

  /** Fetches all balance lines for an account. */
  async getBalances(publicKey: string): Promise<BalanceLine[]> {
    const account = await this.server.loadAccount(publicKey);
    return account.balances.map((b: any) => ({
      asset: b.asset_type === 'native' ? 'XLM' : b.asset_code,
      issuer: b.asset_issuer,
      balance: b.balance,
    }));
  }

  /** Returns true if the account exists on the network. */
  async accountExists(publicKey: string): Promise<boolean> {
    try {
      await this.server.loadAccount(publicKey);
      return true;
    } catch {
      return false;
    }
  }

  /** Funds a testnet account via Friendbot. No-op on mainnet. */
  async fundTestnetAccount(publicKey: string): Promise<void> {
    if (this.config.network !== 'testnet') {
      throw new Error('Friendbot funding is only available on testnet');
    }
    const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
    if (!res.ok) {
      throw new Error(`Friendbot funding failed: ${res.status}`);
    }
  }

  /**
   * Establishes a trustline from an account to a non-native asset. Required
   * before an account can hold USDC or a custom program token.
   */
  async establishTrustline(accountSecret: string, asset: Asset, limit?: string): Promise<SubmitResult> {
    const kp = Keypair.fromSecret(accountSecret);
    const account = await this.server.loadAccount(kp.publicKey());
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.config.networkPassphrase,
    })
      .addOperation(Operation.changeTrust({ asset, limit }))
      .setTimeout(60)
      .build();
    tx.sign(kp);
    return this.submit(tx);
  }

  /** Sends a payment and returns the confirmed transaction result. */
  async sendPayment(params: PaymentParams): Promise<SubmitResult> {
    const kp = Keypair.fromSecret(params.sourceSecret);
    const account = await this.server.loadAccount(kp.publicKey());
    const builder = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.config.networkPassphrase,
    }).addOperation(
      Operation.payment({
        destination: params.destination,
        asset: params.asset,
        amount: params.amount,
      })
    );

    if (params.memo) {
      builder.addMemo(Memo.text(params.memo.slice(0, 28)));
    }

    const tx = builder.setTimeout(60).build();
    tx.sign(kp);
    return this.submit(tx);
  }

  /**
   * Onboards a beneficiary account using SPONSORED RESERVES (CAP-33).
   * The sponsor pays all base + trustline reserves, so the beneficiary
   * account is created with 0 XLM and can immediately hold USDC. This is
   * the Stellar-native primitive that makes onboarding the unbanked free:
   * users never need to acquire XLM.
   *
   * Signed by both the sponsor and the new account (we generated both keys).
   */
  async onboardSponsoredAccount(params: {
    sponsorSecret: string;
    newAccountSecret: string;
    asset: Asset;
    trustLimit?: string;
  }): Promise<SubmitResult> {
    const sponsor = Keypair.fromSecret(params.sponsorSecret);
    const newAccount = Keypair.fromSecret(params.newAccountSecret);
    const sponsorAccount = await this.server.loadAccount(sponsor.publicKey());

    const tx = new TransactionBuilder(sponsorAccount, {
      fee: (Number(BASE_FEE) * 4).toString(),
      networkPassphrase: this.config.networkPassphrase,
    })
      // Sponsor begins covering the new account's reserves.
      .addOperation(
        Operation.beginSponsoringFutureReserves({ sponsoredId: newAccount.publicKey() })
      )
      // Create the account with a 0 starting balance (reserves are sponsored).
      .addOperation(Operation.createAccount({ destination: newAccount.publicKey(), startingBalance: '0' }))
      // Add a trustline for the asset (its reserve is also sponsored).
      .addOperation(
        Operation.changeTrust({ asset: params.asset, limit: params.trustLimit, source: newAccount.publicKey() })
      )
      // The new account ends the sponsorship relationship.
      .addOperation(Operation.endSponsoringFutureReserves({ source: newAccount.publicKey() }))
      .setTimeout(120)
      .build();

    tx.sign(sponsor, newAccount);
    return this.submit(tx);
  }

  /**
   * Creates a claimable balance for a recipient. Used in disaster mode to
   * disburse to people who do not yet have a wallet or a trustline — they
   * can claim the funds later. Native Stellar primitive; no wallet required
   * at disbursement time.
   */
  async createClaimableBalance(params: {
    sourceSecret: string;
    claimant: string;
    asset: Asset;
    amount: string;
  }): Promise<SubmitResult> {
    const source = Keypair.fromSecret(params.sourceSecret);
    const account = await this.server.loadAccount(source.publicKey());
    const claimant = new Claimant(params.claimant, Claimant.predicateUnconditional());
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.config.networkPassphrase,
    })
      .addOperation(
        Operation.createClaimableBalance({ asset: params.asset, amount: params.amount, claimants: [claimant] })
      )
      .setTimeout(60)
      .build();
    tx.sign(source);
    return this.submit(tx);
  }

  /** Reads recent payments for an account directly from the ledger (Horizon). */
  async getAccountPayments(publicKey: string, limit = 20) {
    try {
      const page = await this.server.payments().forAccount(publicKey).order('desc').limit(limit).call();
      return page.records
        .filter((r: any) => r.type === 'payment' || r.type === 'create_account')
        .map((r: any) => ({
          id: r.id,
          type: r.type,
          from: r.from ?? r.funder,
          to: r.to ?? r.account,
          amount: r.amount ?? r.starting_balance,
          asset: r.asset_code ?? (r.asset_type === 'native' ? 'XLM' : undefined),
          createdAt: r.created_at,
          txHash: r.transaction_hash,
        }));
    } catch {
      return [];
    }
  }

  /** Returns whether a transaction hash is confirmed on-chain, with details. */
  async verifyTransaction(txHash: string) {
    try {
      const tx: any = await this.server.transactions().transaction(txHash).call();
      return {
        confirmed: tx.successful === true,
        ledger: tx.ledger,
        createdAt: tx.created_at,
        sourceAccount: tx.source_account,
        feeCharged: tx.fee_charged,
      };
    } catch {
      return { confirmed: false };
    }
  }

  private async submit(tx: any): Promise<SubmitResult> {
    const res: any = await this.server.submitTransaction(tx);
    return {
      hash: res.hash,
      ledger: res.ledger,
      successful: res.successful ?? true,
    };
  }

  /** Exposes the underlying Horizon server for advanced use. */
  get horizon(): Horizon.Server {
    return this.server;
  }
}
