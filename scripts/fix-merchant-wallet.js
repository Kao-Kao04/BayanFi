/**
 * One-time fix: provision a Stellar wallet for the seeded store merchant.
 * Run: node scripts/fix-merchant-wallet.js
 */
const { PrismaClient } = require('@prisma/client');
const { Keypair } = require('stellar-sdk');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  const merchant = await prisma.merchant.findFirst({
    where: { user: { email: 'store@bayanfi.io' } },
    include: { user: true },
  });
  if (!merchant) { console.log('Merchant not found'); return; }
  if (merchant.walletId) { console.log('Merchant already has a wallet:', merchant.walletId); return; }

  console.log('Provisioning wallet for merchant:', merchant.businessName);

  // Fund on testnet via Friendbot
  const kp = Keypair.random();
  const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(kp.publicKey())}`);
  if (!res.ok) { console.log('Friendbot failed:', res.status); return; }
  console.log('Funded on testnet:', kp.publicKey());

  // Establish USDC trustline (needed to receive payments)
  // For now, store the wallet — the USDC trustline will be established on first payment
  const wallet = await prisma.wallet.create({
    data: {
      userId: merchant.userId,
      publicKey: kp.publicKey(),
      walletType: 'CUSTODIAL',
      isPrimary: false,
      label: 'Merchant Wallet',
      isFunded: true,
    },
  });
  console.log('Wallet created:', wallet.id);

  // Link wallet to merchant
  await prisma.merchant.update({
    where: { id: merchant.id },
    data: { walletId: wallet.id },
  });

  // Store public key on user for reference
  await prisma.user.update({
    where: { id: merchant.userId },
    data: { stellarPublicKey: kp.publicKey() },
  });

  console.log('Done! Merchant wallet provisioned:', kp.publicKey());
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
