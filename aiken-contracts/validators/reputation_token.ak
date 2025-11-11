use aiken/transaction.{ScriptContext}
use lendada/types.{ReputationRedeemer, UpdateReputation, PenalizeDefault}

validator reputation_token {
  fn mint(redeemer: ReputationRedeemer, context: ScriptContext) -> Bool {
    when redeemer is {
      UpdateReputation { loan_amount: _, repayment_time: _, due_time: _ } -> True
      PenalizeDefault { loan_amount: _ } -> True
    }
  }
}
