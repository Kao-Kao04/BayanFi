/**
 * Stellar account setup script.
 * Generates a platform master keypair, funds it on testnet via Friendbot,
 * and prints the values to add to your .env file.
 *
 * Usage: node scripts/stellar-setup.js
 */
const { Keypair } = require('stellar-sdk');

async function main() {
  const network = process.env.STELLAR_NETWORK || 'testnet';
  const keypair = Keypair.random();

  console.log('\n=== BayanFi Stellar Master Account ===\n');
  console.log('Public Key: ', keypair.publicKey());
  console.log('Secret Key: ', keypair.secret());

  if (network === 'testnet') {
    process.stdout.write('\nFunding on testnet via Friendbot... ');
    try {
      const res = await fetch(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(keypair.publicKey())}`
      );
      console.log(res.ok ? 'done.' : `failed (${res.status}).`);
    } catch (err) {
      console.log(`failed: ${err.message}`);
    }
  }

  console.log('\nAdd these to your .env file:\n');
  console.log(`STELLAR_MASTER_PUBLIC_KEY=${keypair.publicKey()}`);
  console.log(`STELLAR_MASTER_SECRET_KEY=${keypair.secret()}`);
  console.log('\nKeep the secret key safe. Never commit it to version control.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
