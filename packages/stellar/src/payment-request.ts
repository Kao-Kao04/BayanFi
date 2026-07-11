/**
 * Payment request encoding for QR codes. BayanFi encodes merchant payment
 * requests as SEP-0007 style URIs so any compatible wallet can parse them,
 * while also embedding BayanFi-specific metadata.
 */
export interface PaymentRequest {
  destination: string;
  amount?: string;
  assetCode: string;
  assetIssuer?: string;
  memo?: string;
  merchantId?: string;
  label?: string;
}

export class PaymentRequestCodec {
  /** Encodes a payment request as a web+stellar SEP-0007 pay URI. */
  static encode(req: PaymentRequest): string {
    const params = new URLSearchParams();
    params.set('destination', req.destination);
    if (req.amount) params.set('amount', req.amount);
    params.set('asset_code', req.assetCode);
    if (req.assetIssuer) params.set('asset_issuer', req.assetIssuer);
    if (req.memo) params.set('memo', req.memo);
    if (req.merchantId) params.set('x_bayanfi_merchant', req.merchantId);
    if (req.label) params.set('msg', req.label);
    return `web+stellar:pay?${params.toString()}`;
  }

  /** Parses a SEP-0007 pay URI back into a PaymentRequest. */
  static decode(uri: string): PaymentRequest {
    const query = uri.split('?')[1] ?? '';
    const params = new URLSearchParams(query);
    const destination = params.get('destination');
    const assetCode = params.get('asset_code');
    if (!destination || !assetCode) {
      throw new Error('Invalid payment request: missing destination or asset');
    }
    return {
      destination,
      amount: params.get('amount') ?? undefined,
      assetCode,
      assetIssuer: params.get('asset_issuer') ?? undefined,
      memo: params.get('memo') ?? undefined,
      merchantId: params.get('x_bayanfi_merchant') ?? undefined,
      label: params.get('msg') ?? undefined,
    };
  }
}
