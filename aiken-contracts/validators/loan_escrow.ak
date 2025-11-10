#  Aiken loan_escrow.ak 

use aiken/hash.{Blake2b_224, Hash}
use aiken/interval.{Finite}
use aiken/list
use aiken/transaction.{
  Input, Output, ScriptContext, Spend, Transaction, ValidityRange,
}
use aiken/transaction/credential.{VerificationKey}
use aiken/transaction/value.{lovelace_of, merge, zero}
use lendada/types.{
  Active, Cancel, Claim, ClaimDefault, Defaulted, Fund, Funded, LoanDatum,
  LoanRedeemer, LoanStatus, Pending, Repaid, Repay,
}
use lendada/utils.{
  calculate_interest, has_min_ada, is_overdue, is_valid_time_range, ms_to_days,
  total_repayment,
}
use lendada/validation.{verify_identity_nft, verify_signature}

validator {
  fn loan_escrow(
    datum: LoanDatum,
    redeemer: LoanRedeemer,
    ctx: ScriptContext,
  ) -> Bool {
    let tx: Transaction = ctx.transaction

    when ctx.purpose is {
      Spend(own_ref) -> {
        when redeemer is {
          // Lender funds the loan
          Fund -> {
            expect Some(own_input) =
              list.find(tx.inputs, fn(input) { input.output_reference == own_ref })

            // Verify loan is in Pending status
            expect datum.status == Pending

            // Verify lender signature
            expect Some(lender_pkh) =
              list.head(tx.extra_signatories)
            expect verify_signature(tx.extra_signatories, lender_pkh)

            // Find continuing output
            expect Some(continuing_output) =
              list.find(
                tx.outputs,
                fn(output) {
                  output.address == own_input.output.address
                },
              )

            // Verify output value includes principal + collateral
            let expected_value = datum.principal + datum.collateral
            expect lovelace_of(continuing_output.value) >= expected_value

            // Verify datum is updated correctly
            expect Some(continuing_datum): Option<LoanDatum> =
              continuing_output.datum
            expect continuing_datum.lender == Some(lender_pkh)
            expect continuing_datum.status == Funded
            expect continuing_datum.funded_at != None

            True
          }

          // Borrower claims the funded loan
          Claim -> {
            // Verify loan is Funded
            expect datum.status == Funded

            // Verify borrower signature
            expect verify_signature(tx.extra_signatories, datum.borrower)

            // Verify identity NFT is present
            let (policy, name) = datum.identity_nft
            expect verify_identity_nft(tx.inputs, policy, name)

            // Verify borrower receives principal
            expect list.any(
              tx.outputs,
              fn(output) {
                output.address.payment_credential == credential.VerificationKeyCredential(
                  datum.borrower,
                ) && lovelace_of(output.value) >= datum.principal
              },
            )

            // Verify continuing output keeps collateral
            expect Some(own_input) =
              list.find(tx.inputs, fn(input) { input.output_reference == own_ref })
            expect Some(continuing_output) =
              list.find(
                tx.outputs,
                fn(output) {
                  output.address == own_input.output.address
                },
              )

            // Verify datum updated to Active
            expect Some(continuing_datum): Option<LoanDatum> =
              continuing_output.datum
            expect continuing_datum.status == Active

            True
          }

          // Borrower repays the loan
          Repay { amount } -> {
            // Verify loan is Active
            expect datum.status == Active

            // Verify borrower signature
            expect verify_signature(tx.extra_signatories, datum.borrower)

            // Calculate required repayment
            let duration_days = ms_to_days(datum.duration)
            let interest =
              calculate_interest(datum.principal, datum.interest_rate, duration_days)
            let total_due = total_repayment(datum.principal, interest)

            // Verify repayment amount is sufficient
            expect amount >= total_due

            // Verify lender receives repayment
            expect Some(lender_pkh) = datum.lender
            expect list.any(
              tx.outputs,
              fn(output) {
                output.address.payment_credential == credential.VerificationKeyCredential(
                  lender_pkh,
                ) && lovelace_of(output.value) >= total_due
              },
            )

            // Verify borrower receives collateral back
            expect list.any(
              tx.outputs,
              fn(output) {
                output.address.payment_credential == credential.VerificationKeyCredential(
                  datum.borrower,
                ) && lovelace_of(output.value) >= datum.collateral
              },
            )

            True
          }

          // Lender claims collateral after default
          ClaimDefault -> {
            // Verify loan is past due date
            expect when tx.validity_range.lower_bound.bound_type is {
              Finite(lower) -> lower > datum.due_at
              _ -> False
            }

            // Verify lender signature
            expect Some(lender_pkh) = datum.lender
            expect verify_signature(tx.extra_signatories, lender_pkh)

            // Verify loan is Active (not yet defaulted)
            expect datum.status == Active || datum.status == Defaulted

            // Verify lender receives collateral
            expect list.any(
              tx.outputs,
              fn(output) {
                output.address.payment_credential == credential.VerificationKeyCredential(
                  lender_pkh,
                ) && lovelace_of(output.value) >= datum.collateral
              },
            )

            True
          }

          // Borrower cancels unfunded loan
          Cancel -> {
            // Verify loan is Pending
            expect datum.status == Pending

            // Verify borrower signature
            expect verify_signature(tx.extra_signatories, datum.borrower)

            // Verify borrower receives collateral back
            expect list.any(
              tx.outputs,
              fn(output) {
                output.address.payment_credential == credential.VerificationKeyCredential(
                  datum.borrower,
                ) && lovelace_of(output.value) >= datum.collateral
              },
            )

            True
          }
        }
      }
      _ -> False
    }
  }
}