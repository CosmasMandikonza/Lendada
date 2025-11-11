use aiken/transaction.{ScriptContext}
use lendada/types.{LoanDatum, LoanRedeemer}

validator loan_escrow {
  fn spend(datum: LoanDatum, redeemer: LoanRedeemer, context: ScriptContext) -> Bool {
    // Minimal pass-through; add real checks later.
    True
  }
}
