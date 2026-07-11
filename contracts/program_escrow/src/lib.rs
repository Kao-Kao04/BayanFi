#![no_std]
//! BayanFi Program Escrow Contract
//!
//! Holds program funds on-chain and enforces disbursement policy that a
//! centralized database alone cannot make trustlessly verifiable:
//!   * a hard budget cap that can never be exceeded, even by an admin
//!   * a per-beneficiary maximum enforced at the protocol level
//!   * de-duplication of disbursements per beneficiary
//!   * a public, immutable record of total distributed funds
//!
//! Why Stellar/Soroban is essential here: the escrow guarantees that public
//! money cannot be over-disbursed or double-paid regardless of what happens
//! in off-chain systems. Any auditor can independently verify the state.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Env, Map, Symbol,
};

#[contracttype]
pub enum DataKey {
    Admin,
    Token,
    Budget,
    Distributed,
    MaxPerBeneficiary,
    /// Map<Address, i128> of amount disbursed per beneficiary.
    Disbursed,
    Initialized,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    BudgetExceeded = 4,
    PerBeneficiaryExceeded = 5,
    InvalidAmount = 6,
}

#[contract]
pub struct ProgramEscrow;

#[contractimpl]
impl ProgramEscrow {
    /// Initializes the escrow with an admin, the asset token, the total
    /// budget cap, and the per-beneficiary maximum. Callable once.
    pub fn initialize(
        env: Env,
        admin: Address,
        token: Address,
        budget: i128,
        max_per_beneficiary: i128,
    ) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Initialized) {
            return Err(Error::AlreadyInitialized);
        }
        if budget <= 0 || max_per_beneficiary <= 0 {
            return Err(Error::InvalidAmount);
        }

        admin.require_auth();

        let storage = env.storage().instance();
        storage.set(&DataKey::Admin, &admin);
        storage.set(&DataKey::Token, &token);
        storage.set(&DataKey::Budget, &budget);
        storage.set(&DataKey::Distributed, &0i128);
        storage.set(&DataKey::MaxPerBeneficiary, &max_per_beneficiary);
        storage.set(&DataKey::Disbursed, &Map::<Address, i128>::new(&env));
        storage.set(&DataKey::Initialized, &true);

        env.events().publish(
            (Symbol::new(&env, "init"),),
            (budget, max_per_beneficiary),
        );
        Ok(())
    }

    /// Disburses `amount` of the program asset to `beneficiary`, enforcing the
    /// budget cap and per-beneficiary maximum. Only the admin may call this.
    pub fn disburse(
        env: Env,
        beneficiary: Address,
        amount: i128,
    ) -> Result<(), Error> {
        Self::assert_initialized(&env)?;
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let budget: i128 = env.storage().instance().get(&DataKey::Budget).unwrap();
        let distributed: i128 = env.storage().instance().get(&DataKey::Distributed).unwrap();
        let max_per: i128 = env
            .storage()
            .instance()
            .get(&DataKey::MaxPerBeneficiary)
            .unwrap();

        // Enforce the global budget cap.
        if distributed + amount > budget {
            return Err(Error::BudgetExceeded);
        }

        // Enforce the per-beneficiary maximum across all prior disbursements.
        let mut disbursed_map: Map<Address, i128> =
            env.storage().instance().get(&DataKey::Disbursed).unwrap();
        let prior = disbursed_map.get(beneficiary.clone()).unwrap_or(0);
        if prior + amount > max_per {
            return Err(Error::PerBeneficiaryExceeded);
        }

        // Transfer the asset from the escrow contract to the beneficiary.
        let token_addr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let client = token::Client::new(&env, &token_addr);
        client.transfer(&env.current_contract_address(), &beneficiary, &amount);

        // Update on-chain accounting.
        disbursed_map.set(beneficiary.clone(), prior + amount);
        env.storage().instance().set(&DataKey::Disbursed, &disbursed_map);
        env.storage()
            .instance()
            .set(&DataKey::Distributed, &(distributed + amount));

        env.events().publish(
            (Symbol::new(&env, "disburse"), beneficiary),
            amount,
        );
        Ok(())
    }

    /// Returns the remaining (uncommitted) budget.
    pub fn remaining(env: Env) -> Result<i128, Error> {
        Self::assert_initialized(&env)?;
        let budget: i128 = env.storage().instance().get(&DataKey::Budget).unwrap();
        let distributed: i128 = env.storage().instance().get(&DataKey::Distributed).unwrap();
        Ok(budget - distributed)
    }

    /// Returns the total distributed so far (public, auditable).
    pub fn distributed(env: Env) -> Result<i128, Error> {
        Self::assert_initialized(&env)?;
        Ok(env.storage().instance().get(&DataKey::Distributed).unwrap())
    }

    /// Returns how much a specific beneficiary has received.
    pub fn beneficiary_total(env: Env, beneficiary: Address) -> Result<i128, Error> {
        Self::assert_initialized(&env)?;
        let map: Map<Address, i128> =
            env.storage().instance().get(&DataKey::Disbursed).unwrap();
        Ok(map.get(beneficiary).unwrap_or(0))
    }

    fn assert_initialized(env: &Env) -> Result<(), Error> {
        if !env.storage().instance().has(&DataKey::Initialized) {
            return Err(Error::NotInitialized);
        }
        Ok(())
    }
}

mod test;
