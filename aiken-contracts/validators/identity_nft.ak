use aiken/hash.{Blake2b_224, Hash}
use aiken/transaction.{ScriptContext}
use aiken/transaction/credential.{VerificationKey}
use lendada/types.{IdentityRedeemer, UpdateKYC, UpdateProof}

validator identity_nft(
  admin_pkh: Hash<Blake2b_224, VerificationKey>,
) {
  fn mint(redeemer: IdentityRedeemer, context: ScriptContext) -> Bool {
    // Minimal, compile-first logic; tighten later.
    when redeemer is {
      UpdateProof { new_proof_hash: _ } -> True
      UpdateKYC { new_level: _ } -> True
    }
  }
}
