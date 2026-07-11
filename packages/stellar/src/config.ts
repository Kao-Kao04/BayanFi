import { Networks } from 'stellar-sdk';

export interface StellarConfig {
  network: 'testnet' | 'mainnet';
  horizonUrl: string;
  networkPassphrase: string;
  sorobanRpcUrl?: string;
}

export const TESTNET_CONFIG: StellarConfig = {
  network: 'testnet',
  horizonUrl: 'https://horizon-testnet.stellar.org',
  networkPassphrase: Networks.TESTNET,
  sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
};

export const MAINNET_CONFIG: StellarConfig = {
  network: 'mainnet',
  horizonUrl: 'https://horizon.stellar.org',
  networkPassphrase: Networks.PUBLIC,
  sorobanRpcUrl: 'https://soroban.stellar.org',
};

// Well-known USDC issuers. Testnet uses the Circle test issuer.
export const USDC_ASSET = {
  code: 'USDC',
  testnetIssuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
  mainnetIssuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
};

export function getUsdcIssuer(network: 'testnet' | 'mainnet'): string {
  return network === 'mainnet' ? USDC_ASSET.mainnetIssuer : USDC_ASSET.testnetIssuer;
}
