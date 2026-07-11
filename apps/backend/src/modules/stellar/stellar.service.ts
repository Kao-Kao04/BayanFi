import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  StellarClient,
  KeypairManager,
  MultisigManager,
  PaymentRequestCodec,
  PaymentRequest,
  StellarConfig,
  TESTNET_CONFIG,
  MAINNET_CONFIG,
  GeneratedKeypair,
  SubmitResult,
} from '@bayanfi/stellar';
import { Asset } from 'stellar-sdk';

/**
 * Backend-facing Stellar service. Wraps the @bayanfi/stellar package and
 * exposes the operations domain modules need. Secret keys passed here are
 * expected to be already decrypted by the caller (WalletsService).
 */
@Injectable()
export class StellarService implements OnModuleInit {
  private readonly logger = new Logger(StellarService.name);
  private client: StellarClient;
  private multisig: MultisigManager;
  private stellarConfig: StellarConfig;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const network = this.config.get<string>('stellar.network') ?? 'testnet';
    this.stellarConfig = network === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;

    // Allow env overrides of the default endpoints.
    const horizonUrl = this.config.get<string>('stellar.horizonUrl');
    if (horizonUrl) this.stellarConfig = { ...this.stellarConfig, horizonUrl };

    this.client = new StellarClient(this.stellarConfig);
    this.multisig = new MultisigManager(this.stellarConfig);
    this.logger.log(`Stellar service initialized on ${network}`);
  }

  get network(): 'testnet' | 'mainnet' {
    return this.stellarConfig.network;
  }

  /** Generates a new keypair for a custodial wallet. */
  generateKeypair(): GeneratedKeypair {
    return KeypairManager.generate();
  }

  isValidPublicKey(publicKey: string): boolean {
    return KeypairManager.isValidPublicKey(publicKey);
  }

  async accountExists(publicKey: string): Promise<boolean> {
    return this.client.accountExists(publicKey);
  }

  /** Funds a new account. On testnet uses Friendbot; on mainnet uses the
   *  platform master account to create + fund with the base reserve. */
  async provisionAccount(publicKey: string): Promise<void> {
    if (this.network === 'testnet') {
      await this.client.fundTestnetAccount(publicKey);
      return;
    }
    const masterSecret = this.config.get<string>('stellar.masterSecretKey');
    if (!masterSecret) {
      throw new Error('Master account not configured for mainnet provisioning');
    }
    // On mainnet, create account with a starting XLM balance for reserves.
    await this.client.sendPayment({
      sourceSecret: masterSecret,
      destination: publicKey,
      amount: '2',
      asset: this.client.native(),
      memo: 'BayanFi account provisioning',
    });
  }

  async getBalances(publicKey: string) {
    if (!(await this.client.accountExists(publicKey))) {
      return [];
    }
    return this.client.getBalances(publicKey);
  }

  /** Resolves an Asset object for a code/issuer pair. */
  resolveAsset(assetCode: string, assetIssuer?: string): Asset {
    if (assetCode === 'XLM') return this.client.native();
    if (assetCode === 'USDC' && !assetIssuer) return this.client.usdc();
    if (!assetIssuer) throw new Error(`Issuer required for asset ${assetCode}`);
    return this.client.customAsset(assetCode, assetIssuer);
  }

  /** Ensures a trustline exists before receiving a non-native asset. */
  async ensureTrustline(accountSecret: string, assetCode: string, assetIssuer?: string): Promise<void> {
    if (assetCode === 'XLM') return;
    const asset = this.resolveAsset(assetCode, assetIssuer);
    const publicKey = KeypairManager.fromSecret(accountSecret).publicKey();
    const balances = await this.client.getBalances(publicKey);
    const hasTrustline = balances.some(
      (b) => b.asset === assetCode && (!assetIssuer || b.issuer === assetIssuer)
    );
    if (!hasTrustline) {
      await this.client.establishTrustline(accountSecret, asset);
      this.logger.log(`Established ${assetCode} trustline for ${publicKey}`);
    }
  }

  /** Sends a payment on the network. */
  async sendPayment(params: {
    sourceSecret: string;
    destination: string;
    amount: string;
    assetCode: string;
    assetIssuer?: string;
    memo?: string;
  }): Promise<SubmitResult> {
    const asset = this.resolveAsset(params.assetCode, params.assetIssuer);
    return this.client.sendPayment({
      sourceSecret: params.sourceSecret,
      destination: params.destination,
      amount: params.amount,
      asset,
      memo: params.memo,
    });
  }

  /**
   * Onboards a beneficiary wallet with SPONSORED RESERVES: the platform
   * master account pays all reserves, so the beneficiary needs 0 XLM.
   * This is how BayanFi onboards the unbanked for free.
   */
  async onboardSponsoredWallet(newAccountSecret: string, assetCode = 'USDC', assetIssuer?: string) {
    const sponsorSecret = this.config.get<string>('stellar.masterSecretKey');
    if (!sponsorSecret) {
      throw new Error('Master (sponsor) account not configured');
    }
    const asset = this.resolveAsset(assetCode, assetIssuer);
    return this.client.onboardSponsoredAccount({ sponsorSecret, newAccountSecret, asset });
  }

  /** Creates a claimable balance (disaster mode: recipient needs no wallet yet). */
  async createClaimableBalance(params: {
    sourceSecret: string;
    claimant: string;
    amount: string;
    assetCode: string;
    assetIssuer?: string;
  }): Promise<SubmitResult> {
    const asset = this.resolveAsset(params.assetCode, params.assetIssuer);
    return this.client.createClaimableBalance({
      sourceSecret: params.sourceSecret,
      claimant: params.claimant,
      asset,
      amount: params.amount,
    });
  }

  /** Reads on-chain payments for an account (for verifiable transparency). */
  async getOnChainPayments(publicKey: string, limit = 20) {
    return this.client.getAccountPayments(publicKey, limit);
  }

  /** Verifies a transaction hash directly against the ledger. */
  async verifyTransaction(txHash: string) {
    return this.client.verifyTransaction(txHash);
  }

  /** Determines whether a disbursement requires multi-sig approval. */
  requiresMultisig(amount: number): boolean {
    const threshold = this.config.get<number>('stellar.multisigThreshold') ?? 1000;
    return amount >= threshold;
  }

  /** Builds an unsigned payment envelope for multi-sig collection. */
  async buildMultisigPayment(params: {
    sourcePublic: string;
    destination: string;
    amount: string;
    assetCode: string;
    assetIssuer?: string;
  }): Promise<string> {
    return this.multisig.buildPaymentEnvelope(params);
  }

  signMultisigEnvelope(xdr: string, signerSecret: string): string {
    return this.multisig.signEnvelope(xdr, signerSecret);
  }

  async submitMultisig(xdr: string): Promise<string> {
    return this.multisig.submitSigned(xdr);
  }

  /** Encodes a merchant payment request for QR display. */
  encodePaymentRequest(req: PaymentRequest): string {
    return PaymentRequestCodec.encode(req);
  }

  decodePaymentRequest(uri: string): PaymentRequest {
    return PaymentRequestCodec.decode(uri);
  }

  /** Returns a Horizon explorer URL for a transaction hash. */
  explorerUrl(txHash: string): string {
    const base =
      this.network === 'mainnet'
        ? 'https://stellar.expert/explorer/public/tx'
        : 'https://stellar.expert/explorer/testnet/tx';
    return `${base}/${txHash}`;
  }
}
