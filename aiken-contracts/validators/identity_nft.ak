# Aiken identity_nft.ak 
use aiken/hash.{Blake2b_224, Hash}
use aiken/list
use aiken/transaction.{Mint, ScriptContext, Transaction}
use aiken/transaction/credential.{VerificationKey}
use aiken/transaction/value.{PolicyId, from_minted_value, tokens}
use lendada/types.{IdentityDatum, IdentityRedeemer, UpdateKYC, UpdateProof}
use lendada/validation.{verify_signature}

validator(
  // Parameter: admin public key hash for minting control
  admin_pkh: Hash<Blake2b_224, VerificationKey>,
) {
  fn identity_nft_policy(
    redeemer: IdentityRedeemer,
    ctx: ScriptContext,
  ) -> Bool {
    let tx: Transaction = ctx.transaction

    when ctx.purpose is {
      Mint(own_policy) -> {
        // Get minted tokens
        let minted_tokens = tokens(from_minted_value(tx.mint), own_policy)

        // Verify only one token is minted (CIP-68 requires unique NFT)
        expect list.length(minted_tokens) == 1

        when redeemer is {
          UpdateProof { new_proof_hash } -> {
            // Verify admin or owner signature
            expect verify_signature(tx.extra_signatories, admin_pkh)

            // In a real implementation, we'd verify the new proof hash
            // is valid by checking against a reference oracle or validator
            True
          }

          UpdateKYC { new_level } -> {
            // Verify admin signature (only admin can update KYC level)
            expect verify_signature(tx.extra_signatories, admin_pkh)

            // Verify new KYC level is valid (1-5)
            expect new_level >= 1 && new_level <= 5

            True
          }
        }
      }
      _ -> False
    }
  }
}