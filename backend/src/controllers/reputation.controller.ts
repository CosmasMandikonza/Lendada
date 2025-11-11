import { Request, Response } from 'express';
import prisma from '../config/database';
import { CreditService } from '../services/credit.service';

const creditService = new CreditService();

export class ReputationController {
  /**
   * Get credit score
   */
  async getCreditScore(req: Request, res: Response) {
    try {
      const { walletAddress } = req.params;
      const { loanAmount, duration } = req.query;

      // Check for cached score
      const cached = await creditService.getCachedCreditScore(walletAddress);
      if (cached) {
        return res.json({
          success: true,
          creditScore: {
            score: cached.score,
            riskLevel: cached.riskLevel,
            maxLoanAmount: Number(cached.maxLoanAmount) / 1_000000,
            interestRate: cached.interestRate,
            cached: true,
            createdAt: cached.createdAt,
          },
        });
      }

      // Calculate new score
      const result = await creditService.getCreditScore(
        walletAddress,
        Number(loanAmount) || 1000,
        Number(duration) || 30
      );

      res.json({
        success: true,
        creditScore: result,
      });
    } catch (error) {
      console.error('Get credit score error:', error);
      res.status(500).json({ error: 'Failed to get credit score' });
    }
  }

  /**
   * Get user reputation
   */
  async getReputation(req: Request, res: Response) {
    try {
      const { walletAddress } = req.params;

      const user = await prisma.user.findUnique({
        where: { walletAddress },
        include: {
          loansAsBorrower: {
            where: { status: { in: ['REPAID', 'DEFAULTED'] } },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const totalLoans = user.loansAsBorrower.length;
      const repaidLoans = user.loansAsBorrower.filter(l => l.status === 'REPAID').length;
      const defaultedLoans = user.loansAsBorrower.filter(l => l.status === 'DEFAULTED').length;

      res.json({
        success: true,
        reputation: {
          points: user.reputationPoints,
          totalLoans,
          repaidLoans,
          defaultedLoans,
          repaymentRate: totalLoans > 0 ? (repaidLoans / totalLoans) * 100 : 0,
          creditScore: user.creditScore,
        },
      });
    } catch (error) {
      console.error('Get reputation error:', error);
      res.status(500).json({ error: 'Failed to fetch reputation' });
    }
  }
}
