use near_contract_standards::fungible_token::events::{FtBurn, FtMint};
use near_contract_standards::fungible_token::metadata::{
    FT_METADATA_SPEC, FungibleTokenMetadata, FungibleTokenMetadataProvider,
};
use near_contract_standards::fungible_token::{
    FungibleToken, FungibleTokenCore, FungibleTokenResolver,
};
use near_contract_standards::storage_management::{
    StorageBalance, StorageBalanceBounds, StorageManagement,
};
use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LazyOption, LookupMap};
use near_sdk::json_types::{U64, U128};
use near_sdk::{
    AccountId, BorshStorageKey, NearToken, PanicOnDefault, PromiseOrValue, env, near, require,
};

const UNIT: u128 = 10_u128.pow(18);
const INITIAL_SUPPLY: u128 = 1_000_000_000 * UNIT;
const MAX_SUPPLY: u128 = 1_050_000_000 * UNIT;
const EPOCH_NS: u64 = 86_400_000_000_000;
const TARGET: u32 = 50;
const LIMIT: u32 = 200;
const MIN_BALANCE: u128 = 1_000 * UNIT;
const REWARD: u128 = 1_000 * UNIT;
const BURN_BPS: u128 = 5;
const DAILY_CAP: u128 = LIMIT as u128 * REWARD;

#[derive(BorshSerialize, BorshStorageKey)]
#[borsh(crate = "near_sdk::borsh")]
enum Key {
    Token,
    Metadata,
    Epoch,
    Checkin,
    Claim,
}

#[derive(BorshDeserialize, BorshSerialize, Clone, Copy, PartialEq, Eq)]
#[borsh(crate = "near_sdk::borsh")]
enum Outcome {
    Active,
    Success,
    Missed,
}

#[derive(BorshDeserialize, BorshSerialize, Clone)]
#[borsh(crate = "near_sdk::borsh")]
struct Epoch {
    count: u32,
    outcome: Outcome,
    reserved: u128,
    claimed: u128,
    burned: u128,
    finalized_at: Option<u64>,
}
impl Default for Epoch {
    fn default() -> Self {
        Self {
            count: 0,
            outcome: Outcome::Active,
            reserved: 0,
            claimed: 0,
            burned: 0,
            finalized_at: None,
        }
    }
}

#[near(serializers = [json])]
pub struct Rules {
    pub epoch_duration_ns: U64,
    pub daily_target: u32,
    pub min_holding: U128,
    pub max_participants: u32,
    pub reward_per_checkin: U128,
    pub treasury_burn_bps: u16,
    pub initial_supply: U128,
    pub max_supply: U128,
    pub max_mint_per_epoch: U128,
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
}
#[near(serializers = [json])]
pub struct Global {
    pub launch_timestamp_ns: U64,
    pub current_day_id: u64,
    pub last_finalized_day: Option<u64>,
    pub current_streak: u64,
    pub longest_streak: u64,
    pub total_supply: U128,
    pub max_supply: U128,
    pub reserved_mint_capacity: U128,
    pub remaining_mint_capacity: U128,
    pub ritual_treasury_balance: U128,
    pub cumulative_rewards_minted: U128,
    pub cumulative_treasury_burned: U128,
    pub successful_epochs: u64,
    pub missed_epochs: u64,
    pub ritual_ended: bool,
}
#[near(serializers = [json])]
pub struct EpochView {
    pub day_id: u64,
    pub checkin_count: u32,
    pub status: String,
    pub target: u32,
    pub reward_reserved: U128,
    pub reward_claimed: U128,
    pub treasury_burned: U128,
    pub finalized_at_ns: Option<U64>,
}
#[near(serializers = [json])]
pub struct AccountEpochView {
    pub checked_in: bool,
    pub reward_claimable: bool,
    pub claimed: bool,
}

#[derive(PanicOnDefault)]
#[near(contract_state)]
pub struct Contract {
    token: FungibleToken,
    metadata: LazyOption<FungibleTokenMetadata>,
    launch: u64,
    epochs: LookupMap<u64, Epoch>,
    checkins: LookupMap<(u64, AccountId), bool>,
    claims: LookupMap<(u64, AccountId), bool>,
    last_finalized: Option<u64>,
    streak: u64,
    longest: u64,
    reserved: u128,
    minted: u128,
    burned: u128,
    successes: u64,
    misses: u64,
    ended: bool,
}

#[near]
impl Contract {
    #[init]
    pub fn new(
        public_account: AccountId,
        liquidity_account: AccountId,
        ecosystem_account: AccountId,
    ) -> Self {
        require!(!env::state_exists(), "Already initialized");
        let treasury_account = env::current_account_id();
        require!(
            public_account != liquidity_account
                && public_account != ecosystem_account
                && liquidity_account != ecosystem_account
                && public_account != treasury_account
                && liquidity_account != treasury_account
                && ecosystem_account != treasury_account,
            "Genesis allocation accounts must be distinct"
        );
        let metadata = FungibleTokenMetadata {
            spec: FT_METADATA_SPEC.to_string(),
            name: "GemBull".to_string(),
            symbol: "GEMBULL".to_string(),
            icon: None,
            reference: None,
            reference_hash: None,
            decimals: 18,
        };
        metadata.assert_valid();
        let mut this = Self {
            token: FungibleToken::new(Key::Token),
            metadata: LazyOption::new(Key::Metadata, Some(&metadata)),
            launch: env::block_timestamp(),
            epochs: LookupMap::new(Key::Epoch),
            checkins: LookupMap::new(Key::Checkin),
            claims: LookupMap::new(Key::Claim),
            last_finalized: None,
            streak: 0,
            longest: 0,
            reserved: 0,
            minted: 0,
            burned: 0,
            successes: 0,
            misses: 0,
            ended: false,
        };
        for (account, amount, memo) in [
            (public_account, 600_000_000 * UNIT, "genesis public"),
            (liquidity_account, 200_000_000 * UNIT, "genesis liquidity"),
            (
                treasury_account,
                150_000_000 * UNIT,
                "genesis ritual treasury",
            ),
            (ecosystem_account, 50_000_000 * UNIT, "genesis ecosystem"),
        ] {
            if this.token.accounts.get(&account).is_none() {
                this.token.internal_register_account(&account);
            }
            this.token.internal_deposit(&account, amount);
            FtMint {
                owner_id: &account,
                amount: U128(amount),
                memo: Some(memo),
            }
            .emit();
        }
        require!(
            this.token.total_supply == INITIAL_SUPPLY,
            "Invalid genesis supply"
        );
        this
    }

    pub fn get_rules(&self) -> Rules {
        Rules {
            epoch_duration_ns: U64(EPOCH_NS),
            daily_target: TARGET,
            min_holding: U128(MIN_BALANCE),
            max_participants: LIMIT,
            reward_per_checkin: U128(REWARD),
            treasury_burn_bps: BURN_BPS as u16,
            initial_supply: U128(INITIAL_SUPPLY),
            max_supply: U128(MAX_SUPPLY),
            max_mint_per_epoch: U128(DAILY_CAP),
            name: "GemBull".to_string(),
            symbol: "GEMBULL".to_string(),
            decimals: 18,
        }
    }

    pub fn get_global_state(&self) -> Global {
        let committed = self
            .token
            .total_supply
            .checked_add(self.reserved)
            .expect("Supply overflow");
        Global {
            launch_timestamp_ns: U64(self.launch),
            current_day_id: self.day(),
            last_finalized_day: self.last_finalized,
            current_streak: self.streak,
            longest_streak: self.longest,
            total_supply: U128(self.token.total_supply),
            max_supply: U128(MAX_SUPPLY),
            reserved_mint_capacity: U128(self.reserved),
            remaining_mint_capacity: U128(
                MAX_SUPPLY
                    .checked_sub(committed)
                    .expect("Supply cap exceeded"),
            ),
            ritual_treasury_balance: U128(self.treasury()),
            cumulative_rewards_minted: U128(self.minted),
            cumulative_treasury_burned: U128(self.burned),
            successful_epochs: self.successes,
            missed_epochs: self.misses,
            ritual_ended: self.ended,
        }
    }

    pub fn get_epoch(&self, day_id: u64) -> EpochView {
        let e = self.epochs.get(&day_id).unwrap_or_default();
        EpochView {
            day_id,
            checkin_count: e.count,
            status: match e.outcome {
                Outcome::Active => "ACTIVE",
                Outcome::Success => "SUCCESS",
                Outcome::Missed => "MISSED",
            }
            .to_string(),
            target: TARGET,
            reward_reserved: U128(e.reserved),
            reward_claimed: U128(e.claimed),
            treasury_burned: U128(e.burned),
            finalized_at_ns: e.finalized_at.map(U64),
        }
    }

    pub fn get_account_epoch_status(&self, account_id: AccountId, day_id: u64) -> AccountEpochView {
        let key = (day_id, account_id);
        let checked_in = self.checkins.get(&key).unwrap_or(false);
        let claimed = self.claims.get(&key).unwrap_or(false);
        let success = self
            .epochs
            .get(&day_id)
            .is_some_and(|e| e.outcome == Outcome::Success);
        AccountEpochView {
            checked_in,
            claimed,
            reward_claimable: checked_in && success && !claimed,
        }
    }

    #[payable]
    pub fn check_in(&mut self) {
        require!(!self.ended, "Ritual ended");
        let day = self.day();
        require!(day == self.next_day(), "Prior epoch awaits settlement");
        let caller = env::predecessor_account_id();
        let balance = self
            .token
            .accounts
            .get(&caller)
            .expect("Storage not registered");
        require!(balance >= MIN_BALANCE, "Minimum GEMBULL balance not met");
        let key = (day, caller.clone());
        require!(
            !self.checkins.get(&key).unwrap_or(false),
            "Already checked in"
        );
        let mut e = self.epochs.get(&day).unwrap_or_default();
        require!(e.outcome == Outcome::Active, "Epoch not active");
        require!(e.count < LIMIT, "Participant cap reached");
        if e.count == 0 {
            let committed = self
                .token
                .total_supply
                .checked_add(self.reserved)
                .expect("Supply overflow");
            require!(
                MAX_SUPPLY.checked_sub(committed).unwrap_or(0) >= DAILY_CAP,
                "Insufficient mint capacity"
            );
            self.reserved = self
                .reserved
                .checked_add(DAILY_CAP)
                .expect("Reservation overflow");
            e.reserved = DAILY_CAP;
        }
        let before = env::storage_usage();
        self.checkins.insert(&key, &true);
        e.count = e.count.checked_add(1).expect("Count overflow");
        self.epochs.insert(&day, &e);
        require_storage_paid(before);
        emit(
            "ritual_check_in",
            near_sdk::serde_json::json!({"day_id": day, "account_id": caller, "checkin_count": e.count}),
        );
    }

    #[payable]
    pub fn finalize_day(&mut self, day_id: u64) {
        require!(!self.ended, "Ritual ended");
        require!(day_id == self.next_day(), "Out-of-order finalization");
        require!(self.day() > day_id, "Epoch has not ended");
        let mut e = self.epochs.get(&day_id).unwrap_or_default();
        require!(e.outcome == Outcome::Active, "Epoch already finalized");
        if e.count >= TARGET {
            e.outcome = Outcome::Success;
            let needed = (e.count as u128)
                .checked_mul(REWARD)
                .expect("Reward overflow");
            self.reserved = self
                .reserved
                .checked_sub(e.reserved - needed)
                .expect("Reservation underflow");
            e.reserved = needed;
            self.streak = self.streak.checked_add(1).expect("Streak overflow");
            self.longest = self.longest.max(self.streak);
            self.successes = self.successes.checked_add(1).expect("Epoch count overflow");
        } else {
            e.outcome = Outcome::Missed;
            self.reserved = self
                .reserved
                .checked_sub(e.reserved)
                .expect("Reservation underflow");
            e.reserved = 0;
            let treasury = self.treasury();
            let mut burn = treasury.checked_mul(BURN_BPS).expect("Burn overflow") / 10_000;
            if treasury > 0 && burn == 0 {
                burn = 1;
            }
            if burn > 0 {
                let account = env::current_account_id();
                self.token.internal_withdraw(&account, burn);
                self.burned = self.burned.checked_add(burn).expect("Burn total overflow");
                FtBurn {
                    owner_id: &account,
                    amount: U128(burn),
                    memo: Some("missed ritual epoch"),
                }
                .emit();
            }
            e.burned = burn;
            self.streak = 0;
            self.misses = self.misses.checked_add(1).expect("Epoch count overflow");
        }
        e.finalized_at = Some(env::block_timestamp());
        let before = env::storage_usage();
        self.epochs.insert(&day_id, &e);
        self.last_finalized = Some(day_id);
        require_storage_paid(before);
        emit(
            "ritual_day_finalized",
            near_sdk::serde_json::json!({
            "day_id": day_id, "outcome": if e.outcome == Outcome::Success { "SUCCESS" } else { "MISSED" },
            "checkin_count": e.count, "target": TARGET, "reward_reserved": U128(e.reserved),
            "burn_amount": U128(e.burned), "current_streak": self.streak, "longest_streak": self.longest }),
        );
        let committed = self
            .token
            .total_supply
            .checked_add(self.reserved)
            .expect("Supply overflow");
        if MAX_SUPPLY.checked_sub(committed).unwrap_or(0) < DAILY_CAP {
            self.ended = true;
            emit(
                "ritual_ended",
                near_sdk::serde_json::json!({
                "reason": "INSUFFICIENT_FULL_EPOCH_CAPACITY", "final_total_supply": U128(self.token.total_supply),
                "final_longest_streak": self.longest }),
            );
        }
    }

    #[payable]
    pub fn claim_reward(&mut self, day_id: u64) {
        let caller = env::predecessor_account_id();
        let key = (day_id, caller.clone());
        let mut e = self.epochs.get(&day_id).expect("Epoch not finalized");
        require!(e.outcome == Outcome::Success, "Reward not available");
        require!(
            self.checkins.get(&key).unwrap_or(false),
            "Not a participant"
        );
        require!(!self.claims.get(&key).unwrap_or(false), "Already claimed");
        require!(
            e.reserved >= REWARD && self.reserved >= REWARD,
            "Missing reservation"
        );
        require!(
            self.token.accounts.get(&caller).is_some(),
            "Storage not registered"
        );
        require!(
            self.token
                .total_supply
                .checked_add(self.reserved)
                .expect("Supply overflow")
                <= MAX_SUPPLY,
            "Supply cap exceeded"
        );
        let before = env::storage_usage();
        self.claims.insert(&key, &true);
        e.reserved = e
            .reserved
            .checked_sub(REWARD)
            .expect("Reservation underflow");
        e.claimed = e.claimed.checked_add(REWARD).expect("Claim overflow");
        self.epochs.insert(&day_id, &e);
        require_storage_paid(before);
        self.reserved = self
            .reserved
            .checked_sub(REWARD)
            .expect("Reservation underflow");
        self.token.internal_deposit(&caller, REWARD);
        self.minted = self
            .minted
            .checked_add(REWARD)
            .expect("Mint total overflow");
        FtMint {
            owner_id: &caller,
            amount: U128(REWARD),
            memo: Some("ritual reward"),
        }
        .emit();
        emit(
            "ritual_reward_claimed",
            near_sdk::serde_json::json!({"day_id": day_id, "account_id": caller, "amount": U128(REWARD)}),
        );
    }
}

impl Contract {
    /// Local Sandbox tests can rebase the serialized state to cross a 24-hour epoch.
    /// This helper is absent from the Wasm contract and its public ABI.
    #[cfg(not(target_arch = "wasm32"))]
    pub fn sandbox_rewind_launch(&mut self, duration_ns: u64) {
        self.launch = self
            .launch
            .checked_sub(duration_ns)
            .expect("Launch underflow");
    }

    fn day(&self) -> u64 {
        env::block_timestamp()
            .checked_sub(self.launch)
            .expect("Clock before launch")
            / EPOCH_NS
    }
    fn next_day(&self) -> u64 {
        self.last_finalized
            .map_or(0, |d| d.checked_add(1).expect("Day overflow"))
    }
    fn treasury(&self) -> u128 {
        self.token
            .accounts
            .get(&env::current_account_id())
            .unwrap_or(0)
    }
}

fn emit(event: &str, data: near_sdk::serde_json::Value) {
    env::log_str(&format!(
        "EVENT_JSON:{}",
        near_sdk::serde_json::json!({
            "standard": "gembull", "version": "1.0.0", "event": event, "data": [data]
        })
    ));
}

fn require_storage_paid(before: u64) {
    let growth = env::storage_usage().saturating_sub(before);
    let required = env::storage_byte_cost().saturating_mul(growth as u128);
    require!(
        env::attached_deposit() >= required,
        "Attach NEAR for ritual storage"
    );
}

#[near]
impl FungibleTokenCore for Contract {
    #[payable]
    fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>) {
        require!(
            env::predecessor_account_id() != env::current_account_id(),
            "Ritual treasury is locked"
        );
        self.token.ft_transfer(receiver_id, amount, memo)
    }
    #[payable]
    fn ft_transfer_call(
        &mut self,
        receiver_id: AccountId,
        amount: U128,
        memo: Option<String>,
        msg: String,
    ) -> PromiseOrValue<U128> {
        require!(
            env::predecessor_account_id() != env::current_account_id(),
            "Ritual treasury is locked"
        );
        self.token.ft_transfer_call(receiver_id, amount, memo, msg)
    }
    fn ft_total_supply(&self) -> U128 {
        self.token.ft_total_supply()
    }
    fn ft_balance_of(&self, account_id: AccountId) -> U128 {
        self.token.ft_balance_of(account_id)
    }
}

#[near]
impl FungibleTokenResolver for Contract {
    #[private]
    fn ft_resolve_transfer(
        &mut self,
        sender_id: AccountId,
        receiver_id: AccountId,
        amount: U128,
    ) -> U128 {
        let (used, _) = self
            .token
            .internal_ft_resolve_transfer(&sender_id, receiver_id, amount);
        used.into()
    }
}

#[near]
impl StorageManagement for Contract {
    #[payable]
    fn storage_deposit(
        &mut self,
        account_id: Option<AccountId>,
        registration_only: Option<bool>,
    ) -> StorageBalance {
        self.token.storage_deposit(account_id, registration_only)
    }
    #[payable]
    fn storage_withdraw(&mut self, amount: Option<NearToken>) -> StorageBalance {
        self.token.storage_withdraw(amount)
    }
    #[payable]
    fn storage_unregister(&mut self, force: Option<bool>) -> bool {
        require!(!force.unwrap_or(false), "Forced unregister disabled");
        require!(
            env::predecessor_account_id() != env::current_account_id(),
            "Treasury cannot unregister"
        );
        self.token
            .internal_storage_unregister(Some(false))
            .is_some()
    }
    fn storage_balance_bounds(&self) -> StorageBalanceBounds {
        self.token.storage_balance_bounds()
    }
    fn storage_balance_of(&self, account_id: AccountId) -> Option<StorageBalance> {
        self.token.storage_balance_of(account_id)
    }
}

#[near]
impl FungibleTokenMetadataProvider for Contract {
    fn ft_metadata(&self) -> FungibleTokenMetadata {
        self.metadata.get().expect("Metadata missing")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::testing_env;

    fn account(name: &str) -> AccountId {
        name.parse().unwrap()
    }

    fn context(caller: AccountId, timestamp: u64) {
        let mut builder = VMContextBuilder::new();
        builder
            .current_account_id(account("gembull.testnet"))
            .signer_account_id(caller.clone())
            .predecessor_account_id(caller)
            .block_timestamp(timestamp)
            .attached_deposit(NearToken::from_near(1));
        testing_env!(builder.build());
    }

    fn setup() -> Contract {
        context(account("owner.testnet"), 0);
        Contract::new(
            account("public.testnet"),
            account("liquidity.testnet"),
            account("ecosystem.testnet"),
        )
    }

    fn checkins_on(contract: &mut Contract, count: u32, day: u64) {
        for i in 0..count {
            let holder = account(&format!("holder-{i}.testnet"));
            if contract.token.accounts.get(&holder).is_none() {
                contract.token.internal_register_account(&holder);
                contract.token.internal_transfer(
                    &account("public.testnet"),
                    &holder,
                    MIN_BALANCE,
                    None,
                );
            }
            context(holder, day * EPOCH_NS);
            contract.check_in();
        }
    }

    fn checkins(contract: &mut Contract, count: u32) {
        checkins_on(contract, count, 0);
    }

    #[test]
    fn genesis_and_successful_claim() {
        let mut contract = setup();
        assert_eq!(contract.ft_metadata().name, "GemBull");
        assert_eq!(contract.ft_metadata().symbol, "GEMBULL");
        assert_eq!(contract.get_rules().name, "GemBull");
        assert_eq!(contract.get_rules().symbol, "GEMBULL");
        assert_eq!(contract.ft_total_supply().0, INITIAL_SUPPLY);
        assert_eq!(
            contract.ft_balance_of(account("gembull.testnet")).0,
            150_000_000 * UNIT
        );
        checkins(&mut contract, TARGET);
        assert_eq!(contract.get_epoch(0).reward_reserved.0, DAILY_CAP);
        assert_eq!(
            contract.get_global_state().reserved_mint_capacity.0,
            DAILY_CAP
        );
        context(account("keeper.testnet"), EPOCH_NS);
        contract.finalize_day(0);
        assert_eq!(contract.get_epoch(0).status, "SUCCESS");
        assert_eq!(
            contract.get_global_state().reserved_mint_capacity.0,
            TARGET as u128 * REWARD
        );
        assert_eq!(contract.get_global_state().current_streak, 1);
        context(account("holder-0.testnet"), EPOCH_NS);
        contract.claim_reward(0);
        assert_eq!(contract.ft_total_supply().0, INITIAL_SUPPLY + REWARD);
        assert_eq!(
            contract.get_global_state().reserved_mint_capacity.0,
            (TARGET as u128 - 1) * REWARD
        );
        assert!(
            contract
                .get_account_epoch_status(account("holder-0.testnet"), 0)
                .claimed
        );
    }

    #[test]
    fn missed_day_burns_treasury_and_releases_capacity() {
        let mut contract = setup();
        checkins(&mut contract, TARGET - 1);
        context(account("keeper.testnet"), EPOCH_NS);
        contract.finalize_day(0);
        assert_eq!(contract.get_epoch(0).status, "MISSED");
        assert_eq!(contract.get_global_state().reserved_mint_capacity.0, 0);
        assert_eq!(contract.get_epoch(0).treasury_burned.0, 75_000 * UNIT);
        assert_eq!(contract.ft_total_supply().0, INITIAL_SUPPLY - 75_000 * UNIT);
        assert_eq!(contract.get_global_state().current_streak, 0);
    }

    #[test]
    #[should_panic(expected = "Already checked in")]
    fn duplicate_checkin_rejected() {
        let mut contract = setup();
        checkins(&mut contract, 1);
        context(account("holder-0.testnet"), 0);
        contract.check_in();
    }

    #[test]
    #[should_panic(expected = "Minimum GEMBULL balance not met")]
    fn below_minimum_balance_cannot_check_in() {
        let mut contract = setup();
        let holder = account("small-holder.testnet");
        contract.token.internal_register_account(&holder);
        contract.token.internal_transfer(
            &account("public.testnet"),
            &holder,
            MIN_BALANCE - 1,
            None,
        );
        context(holder, 0);
        contract.check_in();
    }

    #[test]
    fn holder_can_check_in_again_next_epoch() {
        let mut contract = setup();
        checkins(&mut contract, 1);
        context(account("keeper.testnet"), EPOCH_NS);
        contract.finalize_day(0);
        context(account("holder-0.testnet"), EPOCH_NS);
        contract.check_in();
        assert_eq!(contract.get_epoch(1).checkin_count, 1);
    }

    #[test]
    #[should_panic(expected = "Out-of-order finalization")]
    fn skipped_epoch_rejected() {
        let mut contract = setup();
        context(account("keeper.testnet"), EPOCH_NS * 3);
        contract.finalize_day(1);
    }

    #[test]
    #[should_panic(expected = "Epoch has not ended")]
    fn active_epoch_cannot_be_finalized() {
        let mut contract = setup();
        context(account("keeper.testnet"), 0);
        contract.finalize_day(0);
    }

    #[test]
    #[should_panic(expected = "Out-of-order finalization")]
    fn finalized_epoch_cannot_be_finalized_again() {
        let mut contract = setup();
        context(account("keeper.testnet"), EPOCH_NS);
        contract.finalize_day(0);
        contract.finalize_day(0);
    }

    #[test]
    #[should_panic(expected = "Already claimed")]
    fn duplicate_claim_rejected() {
        let mut contract = setup();
        checkins(&mut contract, TARGET);
        context(account("keeper.testnet"), EPOCH_NS);
        contract.finalize_day(0);
        context(account("holder-0.testnet"), EPOCH_NS);
        contract.claim_reward(0);
        contract.claim_reward(0);
    }

    #[test]
    fn longest_streak_survives_a_miss() {
        let mut contract = setup();
        checkins_on(&mut contract, TARGET, 0);
        context(account("keeper.testnet"), EPOCH_NS);
        contract.finalize_day(0);
        checkins_on(&mut contract, TARGET, 1);
        context(account("keeper.testnet"), EPOCH_NS * 2);
        contract.finalize_day(1);
        assert_eq!(contract.get_global_state().longest_streak, 2);
        context(account("keeper.testnet"), EPOCH_NS * 3);
        contract.finalize_day(2);
        assert_eq!(contract.get_global_state().current_streak, 0);
        assert_eq!(contract.get_global_state().longest_streak, 2);
    }

    #[test]
    #[should_panic(expected = "Participant cap reached")]
    fn participant_cap_rejected() {
        let mut contract = setup();
        checkins(&mut contract, LIMIT);
        assert_eq!(contract.get_epoch(0).checkin_count, LIMIT);
        let extra = account("extra.testnet");
        contract.token.internal_register_account(&extra);
        contract
            .token
            .internal_transfer(&account("public.testnet"), &extra, MIN_BALANCE, None);
        context(extra, 0);
        contract.check_in();
    }

    #[test]
    fn zero_treasury_miss_has_zero_burn() {
        let mut contract = setup();
        contract
            .token
            .internal_withdraw(&account("gembull.testnet"), 150_000_000 * UNIT);
        context(account("keeper.testnet"), EPOCH_NS);
        contract.finalize_day(0);
        assert_eq!(contract.get_epoch(0).treasury_burned.0, 0);
        assert_eq!(contract.get_global_state().ritual_treasury_balance.0, 0);
    }

    #[test]
    fn tiny_treasury_burns_one_base_unit() {
        let mut contract = setup();
        contract
            .token
            .internal_withdraw(&account("gembull.testnet"), 150_000_000 * UNIT - 1);
        context(account("keeper.testnet"), EPOCH_NS);
        contract.finalize_day(0);
        assert_eq!(contract.get_epoch(0).treasury_burned.0, 1);
        assert_eq!(contract.get_global_state().ritual_treasury_balance.0, 0);
    }

    #[test]
    #[should_panic(expected = "Ritual treasury is locked")]
    fn treasury_cannot_transfer_gembull() {
        let mut contract = setup();
        context(account("gembull.testnet"), 0);
        contract.ft_transfer(account("public.testnet"), U128(UNIT), None);
    }

    #[test]
    #[should_panic(expected = "Insufficient mint capacity")]
    fn first_checkin_requires_full_daily_budget() {
        let mut contract = setup();
        let holder = account("holder.testnet");
        contract.token.internal_register_account(&holder);
        contract
            .token
            .internal_transfer(&account("public.testnet"), &holder, MIN_BALANCE, None);
        contract.token.total_supply = MAX_SUPPLY - DAILY_CAP + 1;
        context(holder, 0);
        contract.check_in();
    }

    #[test]
    #[should_panic(expected = "Reward not available")]
    fn failed_epoch_cannot_be_claimed() {
        let mut contract = setup();
        checkins(&mut contract, TARGET - 1);
        context(account("keeper.testnet"), EPOCH_NS);
        contract.finalize_day(0);
        context(account("holder-0.testnet"), EPOCH_NS);
        contract.claim_reward(0);
    }

    #[test]
    #[should_panic(expected = "Not a participant")]
    fn nonparticipant_cannot_claim() {
        let mut contract = setup();
        checkins(&mut contract, TARGET);
        context(account("keeper.testnet"), EPOCH_NS);
        contract.finalize_day(0);
        context(account("outsider.testnet"), EPOCH_NS);
        contract.claim_reward(0);
    }

    #[test]
    fn terminal_state_keeps_existing_claims_valid() {
        let mut contract = setup();
        contract.token.total_supply = MAX_SUPPLY - DAILY_CAP;
        checkins(&mut contract, TARGET);
        context(account("keeper.testnet"), EPOCH_NS);
        contract.finalize_day(0);
        assert!(contract.get_global_state().ritual_ended);
        context(account("holder-0.testnet"), EPOCH_NS);
        contract.claim_reward(0);
        assert!(
            contract
                .get_account_epoch_status(account("holder-0.testnet"), 0)
                .claimed
        );
        assert!(contract.ft_total_supply().0 <= MAX_SUPPLY);
    }

    #[test]
    fn emitted_events_have_nep_297_envelopes() {
        use near_sdk::test_utils::get_logs;
        let mut contract = setup();
        checkins(&mut contract, 1);
        let logs = get_logs();
        let events: Vec<near_sdk::serde_json::Value> = logs
            .iter()
            .filter_map(|log| log.strip_prefix("EVENT_JSON:"))
            .map(|json| near_sdk::serde_json::from_str(json).unwrap())
            .collect();
        assert!(
            events
                .iter()
                .any(|value| value["standard"] == "gembull" && value["event"] == "ritual_check_in")
        );
        assert!(
            events
                .iter()
                .all(|value| value["data"].is_array() && value["version"].is_string())
        );
    }

    #[test]
    #[should_panic(expected = "Genesis allocation accounts must be distinct")]
    fn genesis_rejects_treasury_as_public_account() {
        context(account("owner.testnet"), 0);
        Contract::new(
            account("gembull.testnet"),
            account("liquidity.testnet"),
            account("ecosystem.testnet"),
        );
    }
}
