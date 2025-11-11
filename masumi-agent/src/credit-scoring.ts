import { CreditScoreRequest, CreditScoreResponse, CreditFactor, OnChainMetrics } from './types';
import { BlockchainDataService } from './blockchain-data';

export class CreditScoringEngine {
  private blockchainService: BlockchainDataService;

  constructor() {
    this.blockchainService = new BlockchainDataService();
  }

  async calculateCreditScore(request: CreditScoreRequest): Promise<CreditScoreResponse> {
    // Fetch on-chain metrics
    const metrics = await this.blockchainService.getOnChainMetrics(request.borrowerAddress);

    // Calculate individual factor scores
    const factors: CreditFactor[] = [];
    let totalScore = 300; // Base score

    // Factor 1: Account Age (max +100 points)
    const ageScore = this.scoreAccountAge(metrics.accountAge);
    totalScore += ageScore;
    factors.push({
      name: 'Account Age',
      value: `${metrics.accountAge} days`,
      impact: ageScore > 0 ? 'positive' : 'neutral',
      weight: ageScore
    });

    // Factor 2: Transaction History (max +150 points)
    const txScore = this.scoreTransactionHistory(metrics.totalTransactions);
    totalScore += txScore;
    factors.push({
      name: 'Transaction History',
      value: `${metrics.totalTransactions} transactions`,
      impact: txScore > 50 ? 'positive' : 'neutral',
      weight: txScore
    });

    // Factor 3: Value Transacted (max +100 points)
    const valueScore = this.scoreValueTransacted(metrics.totalValueTransacted);
    totalScore += valueScore;
    factors.push({
      name: 'Total Value Transacted',
      value: `${metrics.totalValueTransacted.toFixed(2)} ADA`,
      impact: valueScore > 30 ? 'positive' : 'neutral',
      weight: valueScore
    });

    // Factor 4: Staking Activity (max +80 points)
    const stakingScore = metrics.stakingActivity ? 80 : 0;
    totalScore += stakingScore;
    factors.push({
      name: 'Staking Activity',
      value: metrics.stakingActivity ? 'Active' : 'Inactive',
      impact: metrics.stakingActivity ? 'positive' : 'negative',
      weight: stakingScore
    });

    // Factor 5: Consistent Activity (max +70 points)
    const consistencyScore = metrics.consistentActivity ? 70 : -30;
    totalScore += consistencyScore;
    factors.push({
      name: 'Activity Consistency',
      value: metrics.consistentActivity ? 'Consistent' : 'Inactive',
      impact: metrics.consistentActivity ? 'positive' : 'negative',
      weight: consistencyScore
    });

    // Factor 6: DeFi Interactions (max +50 points)
    const defiScore = this.scoreDeFiActivity(metrics.dexInteractions);
    totalScore += defiScore;
    factors.push({
      name: 'DeFi Experience',
      value: `${metrics.dexInteractions} interactions`,
      impact: defiScore > 20 ? 'positive' : 'neutral',
      weight: defiScore
    });

    // Factor 7: NFT Holdings (max +50 points)
    const nftScore = this.scoreNFTHoldings(metrics.nftCount);
    totalScore += nftScore;
    factors.push({
      name: 'NFT Portfolio',
      value: `${metrics.nftCount} NFTs`,
      impact: nftScore > 20 ? 'positive' : 'neutral',
      weight: nftScore
    });

    // Factor 8: Average Balance (max +50 points)
    const balanceScore = this.scoreBalance(metrics.averageBalance);
    totalScore += balanceScore;
    factors.push({
      name: 'Average Balance',
      value: `${metrics.averageBalance.toFixed(2)} ADA`,
      impact: balanceScore > 20 ? 'positive' : 'neutral',
      weight: balanceScore
    });

    // Cap score at 850
    const finalScore = Math.min(850, Math.max(300, totalScore));

    // Determine risk level
    const riskLevel = this.determineRiskLevel(finalScore);

    // Calculate max loan amount based on score
    const maxLoanAmount = this.calculateMaxLoan(finalScore, metrics.averageBalance);

    // Calculate suggested interest rate
    const suggestedInterestRate = this.calculateInterestRate(finalScore, riskLevel);

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      finalScore,
      request.loanAmount,
      maxLoanAmount,
      riskLevel
    );

    return {
      score: finalScore,
      riskLevel,
      factors,
      recommendation,
      maxLoanAmount,
      suggestedInterestRate
    };
  }

  private scoreAccountAge(days: number): number {
    if (days >= 365) return 100;
    if (days >= 180) return 70;
    if (days >= 90) return 40;
    if (days >= 30) return 20;
    return 0;
  }

  private scoreTransactionHistory(count: number): number {
    if (count >= 100) return 150;
    if (count >= 50) return 100;
    if (count >= 20) return 60;
    if (count >= 10) return 30;
    return count * 2;
  }

  private scoreValueTransacted(value: number): number {
    if (value >= 10000) return 100;
    if (value >= 5000) return 80;
    if (value >= 1000) return 60;
    if (value >= 500) return 40;
    if (value >= 100) return 20;
    return Math.floor(value / 10);
  }

  private scoreDeFiActivity(interactions: number): number {
    if (interactions >= 20) return 50;
    if (interactions >= 10) return 35;
    if (interactions >= 5) return 20;
    return interactions * 3;
  }

  private scoreNFTHoldings(count: number): number {
    if (count >= 10) return 50;
    if (count >= 5) return 30;
    if (count >= 2) return 15;
    return count * 5;
  }

  private scoreBalance(balance: number): number {
    if (balance >= 10000) return 50;
    if (balance >= 5000) return 40;
    if (balance >= 1000) return 30;
    if (balance >= 500) return 20;
    if (balance >= 100) return 10;
    return 0;
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'very-high' {
    if (score >= 750) return 'low';
    if (score >= 650) return 'medium';
    if (score >= 550) return 'high';
    return 'very-high';
  }

  private calculateMaxLoan(score: number, balance: number): number {
    // Base max loan on score (in ADA)
    let baseMax = 0;
    if (score >= 750) baseMax = 10000;
    else if (score >= 650) baseMax = 5000;
    else if (score >= 550) baseMax = 2000;
    else baseMax = 500;

    // Adjust based on balance (max 50% of average balance)
    const balanceLimit = balance * 0.5;
    
    return Math.min(baseMax, balanceLimit);
  }

  private calculateInterestRate(score: number, riskLevel: string): number {
    // Returns interest rate in basis points
    if (score >= 750) return 500; // 5%
    if (score >= 650) return 800; // 8%
    if (score >= 550) return 1200; // 12%
    return 1500; // 15%
  }

  private generateRecommendation(
    score: number,
    requestedAmount: number,
    maxAmount: number,
    riskLevel: string
  ): string {
    if (requestedAmount > maxAmount) {
      return `Requested amount (${requestedAmount} ADA) exceeds maximum approved amount (${maxAmount} ADA). Consider reducing loan amount or building credit history.`;
    }

    if (riskLevel === 'low') {
      return `Excellent credit profile! Approved for loan with favorable terms.`;
    } else if (riskLevel === 'medium') {
      return `Good credit profile. Approved with standard terms. Consider staking more ADA to improve score.`;
    } else if (riskLevel === 'high') {
      return `Moderate credit risk. Loan approved with higher interest rate. Increase on-chain activity to improve terms.`;
    } else {
      return `High credit risk. Loan approved with maximum interest rate and lower limits. Build transaction history to improve creditworthiness.`;
    }
  }
}
