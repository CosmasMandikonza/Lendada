export interface CreditScoreRequest {
  borrowerAddress: string;
  loanAmount: number;
  duration: number;
}

export interface CreditScoreResponse {
  score: number; // 300-850
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  factors: CreditFactor[];
  recommendation: string;
  maxLoanAmount: number;
  suggestedInterestRate: number; // basis points
}

export interface CreditFactor {
  name: string;
  value: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
}

export interface OnChainMetrics {
  totalTransactions: number;
  totalValueTransacted: number;
  accountAge: number; // days
  stakingActivity: boolean;
  nftCount: number;
  dexInteractions: number;
  averageBalance: number;
  consistentActivity: boolean;
}

export interface MasumiJobRequest {
  jobId: string;
  input: CreditScoreRequest;
  timestamp: number;
}

export interface MasumiJobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: CreditScoreResponse;
  error?: string;
  progress: number;
}
