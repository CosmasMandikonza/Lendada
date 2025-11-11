export interface User {
  walletAddress: string;
  identityNFT?: string;
  kycLevel: number;
  creditScore: number;
  reputationPoints: number;
  hasIdentity: boolean;
}

export interface Loan {
  id: string;
  borrower: string;
  lender?: string;
  principal: number;
  collateral: number;
  interestRate: number;
  duration: number;
  status: LoanStatus;
  createdAt: Date;
  fundedAt?: Date;
  claimedAt?: Date;
  repaidAt?: Date;
  dueAt: Date;
  txHash?: string;
}

export type LoanStatus = 'PENDING' | 'FUNDED' | 'ACTIVE' | 'REPAID' | 'DEFAULTED' | 'CANCELLED';

export interface CreditScore {
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  factors: CreditFactor[];
  recommendation: string;
  maxLoanAmount: number;
  suggestedInterestRate: number;
}

export interface CreditFactor {
  name: string;
  value: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
}

export interface KYCData {
  name: string;
  dateOfBirth: string;
  country: string;
  idNumber: string;
}
