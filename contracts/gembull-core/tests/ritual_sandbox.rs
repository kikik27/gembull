use base64::Engine as _;
use near_api::{AccountId, NearGas, NearToken};
use near_sdk::borsh::BorshDeserialize;
use near_sdk::serde_json::json;

async fn create_account(
    sandbox: &near_sandbox::Sandbox,
    name: &str,
) -> testresult::TestResult<near_api::Account> {
    let account_id: AccountId = name.parse()?;
    sandbox
        .create_account(account_id.as_str().parse()?)
        .initial_balance(NearToken::from_near(20))
        .send()
        .await?;
    Ok(near_api::Account(account_id))
}

async fn advance_epoch(
    sandbox: &near_sandbox::Sandbox,
    contract: &near_api::Contract,
    network: &near_api::NetworkConfig,
) -> testresult::TestResult<()> {
    let state = contract
        .view_storage_with_prefix(b"STATE")
        .fetch_from(network)
        .await?
        .data;
    let encoder = base64::engine::general_purpose::STANDARD;
    let item = state
        .values
        .into_iter()
        .find(|entry| entry.key.0 == encoder.encode(b"STATE"))
        .ok_or_else(|| std::io::Error::other("Missing contract state"))?;
    let bytes = encoder.decode(item.value.0)?;
    let mut core = gembull_core::Contract::try_from_slice(&bytes)?;
    core.sandbox_rewind_launch(86_400_000_000_000);
    let patched = near_sdk::borsh::to_vec(&core)?;
    sandbox
        .patch_state(contract.account_id().as_str().parse()?)
        .storage(encoder.encode(b"STATE"), encoder.encode(patched))
        .send()
        .await?;
    Ok(())
}

#[tokio::test]
async fn missed_and_successful_epochs_with_claim_on_sandbox() -> testresult::TestResult<()> {
    let wasm = std::fs::read("target/near/gembull_core.wasm")?;
    let sandbox = near_sandbox::Sandbox::start_sandbox().await?;
    let network = near_api::NetworkConfig::from_rpc_url("sandbox", sandbox.rpc_addr.parse()?);
    let alice = create_account(&sandbox, "alice.sandbox").await?;
    let liquidity = create_account(&sandbox, "liquidity.sandbox").await?;
    let ecosystem = create_account(&sandbox, "ecosystem.sandbox").await?;
    let contract = create_account(&sandbox, "gembull.sandbox")
        .await?
        .as_contract();
    let signer = near_api::Signer::from_secret_key(
        near_sandbox::config::DEFAULT_GENESIS_ACCOUNT_PRIVATE_KEY.parse()?,
    )?;
    near_api::Contract::deploy(contract.account_id().clone())
        .use_code(wasm)
        .with_init_call(
            "new",
            json!({
                "public_account": alice.account_id(),
                "liquidity_account": liquidity.account_id(),
                "ecosystem_account": ecosystem.account_id()
            }),
        )?
        .with_signer(signer.clone())
        .send_to(&network)
        .await?
        .assert_success();

    contract
        .call_function("check_in", ())
        .transaction()
        .gas(NearGas::from_tgas(100))
        .deposit(NearToken::from_near(1))
        .with_signer(alice.account_id().clone(), signer.clone())
        .send_to(&network)
        .await?
        .assert_success();
    contract
        .call_function("check_in", ())
        .transaction()
        .gas(NearGas::from_tgas(100))
        .deposit(NearToken::from_near(1))
        .with_signer(alice.account_id().clone(), signer.clone())
        .send_to(&network)
        .await?
        .assert_failure();

    advance_epoch(&sandbox, &contract, &network).await?;
    contract
        .call_function("finalize_day", json!({"day_id": 0}))
        .transaction()
        .gas(NearGas::from_tgas(100))
        .deposit(NearToken::from_near(1))
        .with_signer(liquidity.account_id().clone(), signer.clone())
        .send_to(&network)
        .await?
        .assert_success();
    let epoch: near_sdk::serde_json::Value = contract
        .call_function("get_epoch", json!({"day_id": 0}))
        .read_only()
        .fetch_from(&network)
        .await?
        .data;
    assert_eq!(epoch["status"], "MISSED");
    assert_eq!(epoch["treasury_burned"], "75000000000000000000000");
    eprintln!("Sandbox missed epoch and burn verified");

    for participant in [&alice, &liquidity, &ecosystem] {
        contract
            .call_function("check_in", ())
            .transaction()
            .gas(NearGas::from_tgas(100))
            .deposit(NearToken::from_near(1))
            .with_signer(participant.account_id().clone(), signer.clone())
            .send_to(&network)
            .await?
            .assert_success();
    }
    for index in 0..47 {
        let holder = create_account(&sandbox, &format!("holder-{index}.sandbox")).await?;
        contract
            .call_function(
                "storage_deposit",
                json!({"account_id": holder.account_id(), "registration_only": true}),
            )
            .transaction()
            .gas(NearGas::from_tgas(100))
            .deposit(NearToken::from_near(1))
            .with_signer(holder.account_id().clone(), signer.clone())
            .send_to(&network)
            .await?
            .assert_success();
        contract
            .call_function(
                "ft_transfer",
                json!({"receiver_id": holder.account_id(), "amount": "1000000000000000000000"}),
            )
            .transaction()
            .gas(NearGas::from_tgas(100))
            .deposit(NearToken::from_yoctonear(1))
            .with_signer(alice.account_id().clone(), signer.clone())
            .send_to(&network)
            .await?
            .assert_success();
        contract
            .call_function("check_in", ())
            .transaction()
            .gas(NearGas::from_tgas(100))
            .deposit(NearToken::from_near(1))
            .with_signer(holder.account_id().clone(), signer.clone())
            .send_to(&network)
            .await?
            .assert_success();
        if index % 10 == 9 {
            eprintln!("Sandbox participant {} of 50 checked in", index + 4);
        }
    }
    advance_epoch(&sandbox, &contract, &network).await?;
    contract
        .call_function("finalize_day", json!({"day_id": 1}))
        .transaction()
        .gas(NearGas::from_tgas(100))
        .deposit(NearToken::from_near(1))
        .with_signer(liquidity.account_id().clone(), signer.clone())
        .send_to(&network)
        .await?
        .assert_success();
    let successful: near_sdk::serde_json::Value = contract
        .call_function("get_epoch", json!({"day_id": 1}))
        .read_only()
        .fetch_from(&network)
        .await?
        .data;
    assert_eq!(successful["status"], "SUCCESS");
    assert_eq!(successful["checkin_count"], 50);
    eprintln!("Sandbox successful epoch verified");
    contract
        .call_function("claim_reward", json!({"day_id": 1}))
        .transaction()
        .gas(NearGas::from_tgas(100))
        .deposit(NearToken::from_near(1))
        .with_signer(alice.account_id().clone(), signer.clone())
        .send_to(&network)
        .await?
        .assert_success();
    contract
        .call_function("claim_reward", json!({"day_id": 1}))
        .transaction()
        .gas(NearGas::from_tgas(100))
        .deposit(NearToken::from_near(1))
        .with_signer(alice.account_id().clone(), signer)
        .send_to(&network)
        .await?
        .assert_failure();
    Ok(())
}
