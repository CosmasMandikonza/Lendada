import axios from 'axios';
import prisma from '../config/database';

const MASUMI_AGENT_URL = process.env.MASUMI_AGENT_URL || 'http://localhost:3001';

export class CreditService {
  /**
   * Request credit score from Masumi agent
   */
  async getCreditScore(
    walletAddress: string,
    loanAmount: number,
    duration: number
  ): Promise<any> {
    try {
      // Start credit scoring job
      const response = await axios.post(`${MASUMI_AGENT_URL}/start_job`, {
        borrowerAddress: walletAddress,
        loanAmount,
        duration,
      });

      const { jobId } = response.data;

      // Poll for results
      const result = await this.pollJobStatus(jobId);

      // Save to database
      await prisma.creditCheck.create({
        data: {
          walletAddress,
          score: result.score,
          riskLevel: result.riskLevel,
          maxLoanAmount: BigInt(result.maxLoanAmount * 1_000000),
          interestRate: result.suggestedInterestRate,
          jobId,
        },
      });

      return result;
    } catch (error) {
      console.error('Credit scoring error:', error);
      throw new Error('Failed to calculate credit score');
    }
  }

  /**
   * Poll job status until completion
   */
  private async pollJobStatus(jobId: string, maxAttempts = 20): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await axios.get(`${MASUMI_AGENT_URL}/status/${jobId}`);
      const status = response.data;

      if (status.status === 'completed') {
        return status.result;
      }

      if (status.status === 'failed') {
        throw new Error(status.error || 'Credit scoring failed');
      }

      // Wait 1 second before next poll
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Credit scoring timeout');
  }

  /**
   * Get cached credit score
   */
  async getCachedCreditScore(walletAddress: string): Promise<any | null> {
    const recentCheck = await prisma.creditCheck.findFirst({
      where: {
        walletAddress,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return recentCheck;
  }
}