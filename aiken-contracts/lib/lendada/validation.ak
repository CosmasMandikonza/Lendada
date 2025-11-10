
use aiken/hash.{Blake2b_224, Hash}
use aiken/list
use aiken/transaction.{Input, Output, Transaction}
use aiken/transaction/credential.{VerificationKey}
use aiken/transaction/value.{AssetName, PolicyId, quantity_of}
use lendada/types.{IdentityDatum}

/// Verify that a valid identity NFT is present in transaction inputs
pub fn verify_identity_nft(
  inputs: List<Input>,
  policy_id: PolicyId,
  asset_name: AssetName,
) -> Bool {
  list.any(
    inputs,
    fn(input) { quantity_of(input.output.value, policy_id, asset_name) == 1 },
  )
}

/// Verify ZK proof hash matches
pub fn verify_zk_proof(
  stored_hash: ByteArray,
  provided_hash: ByteArray,
) -> Bool {
  stored_hash == provided_hash
}

/// Verify signature is present in transaction
pub fn verify_signature(
  signatories: List<Hash<Blake2b_224, VerificationKey>>,
  required_signer: Hash<Blake2b_224, VerificationKey>>,
) -> Bool {
  list.has(signatories, required_signer)
}

/// Verify minimum credit score requirement
pub fn meets_credit_requirement(
  borrower_score: Int,
  min_required: Int,
) -> Bool {
  borrower_score >= min_required
}

/// Verify KYC level is sufficient
pub fn has_sufficient_kyc(kyc_level: Int, min_level: Int) -> Bool {
  kyc_level >= min_level
}

/// Verify collateral is sufficient (e.g., 150% of principal)
pub fn has_sufficient_collateral(
  collateral: Int,
  principal: Int,
  min_ratio_bp: Int,
) -> Bool {
  collateral * 10000 >= principal * min_ratio_bp
}