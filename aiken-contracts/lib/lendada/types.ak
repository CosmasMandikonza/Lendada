use aiken/hash.{Blake2b_224, Hash}
use aiken/transaction/credential.{VerificationKey}
use aiken/transaction/value.{AssetName, PolicyId}

/// Borrower identity with ZK proof verification
pub type IdentityDatum {
  /// Public key of the identity owner
  owner: Hash<Blake2b_224, VerificationKey>,
  /// Hash of ZK proof (SNARK proof hash)
  zk_proof_hash: ByteArray,
  /// Timestamp of identity creation
  created_at: Int,
  /// KYC level (1-5, higher = more verification)
  kyc_level: Int,
  /// Country code (for compliance)
  country_code: ByteArray,
}

/// Credit score data
pub type CreditScore {
  /// Score from 300-850 (FICO-like)
  score: Int,
  /// Total loans taken
  total_loans: Int,
  /// Successfully repaid loans
  repaid_loans: Int,
  /// Total value borrowed (in lovelace)
  total_borrowed: Int,
  /// Total value repaid (in lovelace)
  total_repaid: Int,
  /// Last updated timestamp
  last_updated: Int,
}

/// Loan parameters and state
pub type LoanDatum {
  /// Borrower's public key hash
  borrower: Hash<Blake2b_224, VerificationKey>,
  /// Lender's public key hash (None if not yet funded)
  lender: Option<Hash<Blake2b_224, VerificationKey>>,
  /// Loan amount in lovelace
  principal: Int,
  /// Interest rate (basis points, e.g., 500 = 5%)
  interest_rate: Int,
  /// Loan duration in milliseconds
  duration: Int,
  /// Collateral amount in lovelace
  collateral: Int,
  /// Loan creation timestamp
  created_at: Int,
  /// Loan funded timestamp (None if not funded)
  funded_at: Option<Int>,
  /// Loan due timestamp
  due_at: Int,
  /// Current loan status
  status: LoanStatus,
  /// Reference to borrower's identity NFT
  identity_nft: (PolicyId, AssetName),
  /// Minimum credit score required
  min_credit_score: Int,
}

/// Loan lifecycle status
pub type LoanStatus {
  /// Waiting for a lender
  Pending
  /// Lender has funded, waiting for borrower to claim
  Funded
  /// Borrower has claimed funds
  Active
  /// Loan fully repaid
  Repaid
  /// Loan defaulted (past due date)
  Defaulted
  /// Loan cancelled before funding
  Cancelled
}

/// Reputation token metadata
pub type ReputationDatum {
  /// Owner's public key hash
  owner: Hash<Blake2b_224, VerificationKey>,
  /// Reputation points (0-10000)
  reputation_points: Int,
  /// Total completed loans
  completed_loans: Int,
  /// Total defaults
  defaults: Int,
  /// Average repayment time (in percentage of due date)
  avg_repayment_time: Int,
  /// Last updated timestamp
  last_updated: Int,
}

/// Loan escrow redeemer actions
pub type LoanRedeemer {
  /// Lender funds the loan
  Fund
  /// Borrower claims funded loan
  Claim
  /// Borrower repays the loan
  Repay { amount: Int }
  /// Lender claims collateral after default
  ClaimDefault
  /// Borrower cancels unfunded loan
  Cancel
}

/// Identity NFT redeemer
pub type IdentityRedeemer {
  /// Update ZK proof
  UpdateProof { new_proof_hash: ByteArray }
  /// Update KYC level
  UpdateKYC { new_level: Int }
}

/// Reputation token redeemer
pub type ReputationRedeemer {
  /// Update after successful repayment
  UpdateReputation {
    loan_amount: Int,
    repayment_time: Int,
    due_time: Int,
  }
  /// Penalize for default
  PenalizeDefault { loan_amount: Int }
}
