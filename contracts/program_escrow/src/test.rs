#![cfg(test)]
use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{StellarAssetClient, TokenClient},
    Address, Env,
};

/// Creates a Stellar Asset Contract and returns (token client, admin client).
fn create_token<'a>(env: &Env, admin: &Address) -> (TokenClient<'a>, StellarAssetClient<'a>) {
    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    let addr = sac.address();
    (
        TokenClient::new(env, &addr),
        StellarAssetClient::new(env, &addr),
    )
}

fn setup(env: &Env) -> (ProgramEscrowClient, Address, TokenClient, StellarAssetClient) {
    let admin = Address::generate(env);
    let (token, token_admin) = create_token(env, &admin);

    let contract_id = env.register(ProgramEscrow, ());
    let client = ProgramEscrowClient::new(env, &contract_id);

    // Fund the escrow contract with the program budget.
    token_admin.mint(&contract_id, &1_000_000);

    (client, admin, token, token_admin)
}

#[test]
fn test_initialize_and_disburse() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, admin, token, _token_admin) = setup(&env);
    let token_address = token.address.clone();

    client.initialize(&admin, &token_address, &1_000_000, &20_000);
    assert_eq!(client.remaining(), 1_000_000);

    let beneficiary = Address::generate(&env);
    client.disburse(&beneficiary, &15_000);

    assert_eq!(client.distributed(), 15_000);
    assert_eq!(client.remaining(), 985_000);
    assert_eq!(client.beneficiary_total(&beneficiary), 15_000);
    assert_eq!(token.balance(&beneficiary), 15_000);
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn test_per_beneficiary_cap_enforced() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, admin, token, _) = setup(&env);
    client.initialize(&admin, &token.address, &1_000_000, &20_000);

    let beneficiary = Address::generate(&env);
    client.disburse(&beneficiary, &15_000);
    // Second disbursement would exceed the 20,000 per-beneficiary cap.
    client.disburse(&beneficiary, &10_000);
}

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn test_budget_cap_enforced() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let (token, token_admin) = create_token(&env, &admin);
    let contract_id = env.register(ProgramEscrow, ());
    let client = ProgramEscrowClient::new(&env, &contract_id);
    token_admin.mint(&contract_id, &1_000_000);

    // Small budget, generous per-beneficiary cap.
    client.initialize(&admin, &token.address, &10_000, &1_000_000);

    let beneficiary = Address::generate(&env);
    // Exceeds the 10,000 total budget.
    client.disburse(&beneficiary, &15_000);
}
