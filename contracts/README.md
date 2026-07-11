# BayanFi Soroban Smart Contracts

On-chain contracts that provide trustless enforcement of public-money policy.

## Contracts

### `program_escrow`

Holds program funds and enforces disbursement rules that a database cannot make
trustlessly verifiable:

- **Hard budget cap** — total disbursed can never exceed the program budget, even by an admin.
- **Per-beneficiary maximum** — enforced at the protocol level across all disbursements.
- **On-chain accounting** — `distributed()`, `remaining()`, and `beneficiary_total()` are publicly auditable.
- **Admin authorization** — every disbursement requires the admin signature via `require_auth()`.

#### Why Stellar/Soroban is essential

The escrow guarantees public money cannot be over-disbursed or double-paid
regardless of off-chain system behavior. Any citizen or auditor can
independently verify the escrow's state on the public ledger — this is the
core transparency guarantee BayanFi makes, and it is impossible with a
traditional database alone.

## Prerequisites

- Rust toolchain (`rustup`)
- `wasm32-unknown-unknown` target: `rustup target add wasm32-unknown-unknown`
- Stellar CLI: `cargo install --locked stellar-cli`
- On Windows: Visual Studio C++ Build Tools (for host proc-macro compilation)

## Build

```bash
# From contracts/program_escrow
stellar contract build
# or
cargo build --target wasm32-unknown-unknown --release
```

The optimized WASM is emitted to
`target/wasm32-unknown-unknown/release/program_escrow.wasm`.

## Test

```bash
cargo test
```

Tests cover initialization, successful disbursement, per-beneficiary cap
enforcement, and global budget cap enforcement using the Stellar Asset
Contract test utilities.

## Deploy (testnet)

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/program_escrow.wasm \
  --source <SECRET_KEY> \
  --network testnet
```

Then initialize:

```bash
stellar contract invoke --id <CONTRACT_ID> --source <SECRET> --network testnet \
  -- initialize \
  --admin <ADMIN_G...> \
  --token <USDC_CONTRACT_ADDRESS> \
  --budget 5000000 \
  --max_per_beneficiary 20000
```

## Integration

The backend `StellarService` can invoke the escrow via Soroban RPC for
high-assurance programs. For standard programs, classic Stellar payments are
used for speed and lower cost; the escrow is used where on-chain policy
enforcement adds real value (large budgets, multi-party oversight).
