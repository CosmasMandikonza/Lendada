import { Request, Response } from 'express';
import prisma from '../config/database';
import { BlockchainService } from '../services/blockchain.service';
import { CreditService } from '../services/credit.service';
import { COLLATERAL_RATIO, MIN_LOAN_AMOUNT, MAX_LOAN_AMOUNT } from '../config/cardano';

const blockchainService = new BlockchainService();
const creditService = new CreditService();

export class LoanController {
  /**
   * Create a new loan request
   */
  async createLoan(req: Request, res: Response) {
    try {
      const {
        borrowerAddress,
        principal,
        interestRate,
        duration,
      } = req.body;

      // Validate inputs
      if (principal < MIN_LOAN_AMOUNT / 1_000000 || principal > MAX_LOAN_AMOUNT / 1_000000) {
        return res.status(400).json({
          error: `Loan amount must be between ${MIN_LOAN_AMOUNT / 1_000000} and ${MAX_LOAN_AMOUNT / 1_000000} ADA`,
        });
      }

      // Get or create user
      let user = await prisma.user.findUnique({
        where: { walletAddress: borrowerAddress },
      });

      if (!user) {
        return res.status(400).json({
          error: 'User must complete identity verification first',
        });
      }

      // Check credit score
      const creditScore = await creditService.getCachedCreditScore(borrowerAddress);
      if (!creditScore) {
        return res.status(400).json({
          error: 'Credit score required. Please run credit check first.',
        });
      }

      if (principal > Number(creditScore.maxLoanAmount) / 1_000000) {
        return res.status(400).json({
          error: `Maximum approved loan amount is ${Number(creditScore.maxLoanAmount) / 1_000000} ADA`,
        });
      }

      // Calculate collateral
      const collateral = (principal * COLLATERAL_RATIO) / 10000;

      // Create loan on-chain
      const { txHash, utxoRef } = await blockchainService.createLoan(
        borrowerAddress,
        principal,
        interestRate || creditScore.interestRate,
        duration,
        collateral,
        {
          policyId: user.identityNFT!.split('.')[0],
          assetName: user.identityNFT!.split('.')[1],
        },
        creditScore.score
      );

      // Save to database
      const dueDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
      const loan = await prisma.loan.create({
        data: {
          borrowerId: user.id,
          principal: BigInt(principal * 1_000000),
          interestRate: interestRate || creditScore.interestRate,
          duration,
          collateral: BigInt(collateral * 1_000000),
          status: 'PENDING',
          txHash,
          utxoRef,
          dueAt: dueDate,
        },
      });

      // Record transaction
      await prisma.transaction.create({
        data: {
          userId: user.id,
          loanId: loan.id,
          type: 'LOAN_CREATE',
          amount: BigInt(collateral * 1_000000),
          txHash,
          status: 'confirmed',
        },
      });

      res.json({
        success: true,
        loan: {
          id: loan.id,
          principal: Number(loan.principal) / 1_000000,
          collateral: Number(loan.collateral) / 1_000000,
          interestRate: loan.interestRate,
          duration: loan.duration,
          status: loan.status,
          dueAt: loan.dueAt,
          txHash,
        },
      });
    } catch (error) {
      console.error('Create loan error:', error);
      res.status(500).json({ error: 'Failed to create loan' });
    }
  }

  /**
   * Fund a loan as a lender
   */
  async fundLoan(req: Request, res: Response) {
    try {
      const { loanId } = req.params;
      const { lenderAddress } = req.body;

      // Get loan
      const loan = await prisma.loan.findUnique({
        where: { id: loanId },
        include: { borrower: true },
      });

      if (!loan) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      if (loan.status !== 'PENDING') {
        return res.status(400).json({ error: 'Loan is not available for funding' });
      }

      // Get or create lender
      let lender = await prisma.user.findUnique({
        where: { walletAddress: lenderAddress },
      });

      if (!lender) {
        lender = await prisma.user.create({
          data: { walletAddress: lenderAddress },
        });
      }

      // Fund loan on-chain
      const txHash = await blockchainService.fundLoan(
        lenderAddress,
        loan.utxoRef!,
        Number(loan.principal) / 1_000000
      );

      // Update loan
      const updatedLoan = await prisma.loan.update({
        where: { id: loanId },
        data: {
          lenderId: lender.id,
          status: 'FUNDED',
          fundedAt: new Date(),
        },
      });

      // Record transaction
      await prisma.transaction.create({
        data: {
          userId: lender.id,
          loanId: loan.id,
          type: 'LOAN_FUND',
          amount: loan.principal,
          txHash,
          status: 'confirmed',
        },
      });

      res.json({
        success: true,
        loan: updatedLoan,
        txHash,
      });
    } catch (error) {
      console.error('Fund loan error:', error);
      res.status(500).json({ error: 'Failed to fund loan' });
    }
  }

  /**
   * Claim funded loan as borrower
   */
  async claimLoan(req: Request, res: Response) {
    try {
      const { loanId } = req.params;
      const { borrowerAddress } = req.body;

      const loan = await prisma.loan.findUnique({
        where: { id: loanId },
        include: { borrower: true },
      });

      if (!loan) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      if (loan.borrower.walletAddress !== borrowerAddress) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      if (loan.status !== 'FUNDED') {
        return res.status(400).json({ error: 'Loan is not ready to be claimed' });
      }

      // Claim loan on-chain
      const txHash = await blockchainService.claimLoan(
        borrowerAddress,
        loan.utxoRef!
      );

      // Update loan
      const updatedLoan = await prisma.loan.update({
        where: { id: loanId },
        data: {
          status: 'ACTIVE',
          claimedAt: new Date(),
        },
      });

      // Record transaction
      await prisma.transaction.create({
        data: {
          userId: loan.borrowerId,
          loanId: loan.id,
          type: 'LOAN_CLAIM',
          amount: loan.principal,
          txHash,
          status: 'confirmed',
        },
      });

      res.json({
        success: true,
        loan: updatedLoan,
        txHash,
      });
    } catch (error) {
      console.error('Claim loan error:', error);
      res.status(500).json({ error: 'Failed to claim loan' });
    }
  }

  /**
   * Repay loan
   */
  async repayLoan(req: Request, res: Response) {
    try {
      const { loanId } = req.params;
      const { borrowerAddress, amount } = req.body;

      const loan = await prisma.loan.findUnique({
        where: { id: loanId },
        include: { borrower: true },
      });

      if (!loan) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      if (loan.borrower.walletAddress !== borrowerAddress) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      if (loan.status !== 'ACTIVE') {
        return res.status(400).json({ error: 'Loan is not active' });
      }

      // Repay loan on-chain
      const txHash = await blockchainService.repayLoan(
        borrowerAddress,
        loan.utxoRef!,
        amount
      );

      // Update loan
      const updatedLoan = await prisma.loan.update({
        where: { id: loanId },
        data: {
          status: 'REPAID',
          repaidAt: new Date(),
        },
      });

      // Update reputation
      await blockchainService.updateReputation(
        borrowerAddress,
        Number(loan.principal),
        Date.now(),
        loan.dueAt.getTime()
      );

      // Update user reputation
      await prisma.user.update({
        where: { id: loan.borrowerId },
        data: {
          reputationPoints: {
            increment: Math.floor(Number(loan.principal) / 1_000000),
          },
        },
      });

      // Record transaction
      await prisma.transaction.create({
        data: {
          userId: loan.borrowerId,
          loanId: loan.id,
          type: 'LOAN_REPAY',
          amount: BigInt(amount * 1_000000),
          txHash,
          status: 'confirmed',
        },
      });

      res.json({
        success: true,
        loan: updatedLoan,
        txHash,
      });
    } catch (error) {
      console.error('Repay loan error:', error);
      res.status(500).json({ error: 'Failed to repay loan' });
    }
  }

  /**
   * Get all loans
   */
  async getLoans(req: Request, res: Response) {
    try {
      const { status, userAddress } = req.query;

      const where: any = {};
      if (status) where.status = status;

      if (userAddress) {
        const user = await prisma.user.findUnique({
          where: { walletAddress: userAddress as string },
        });
        if (user) {
          where.OR = [
            { borrowerId: user.id },
            { lenderId: user.id },
          ];
        }
      }

      const loans = await prisma.loan.findMany({
        where,
        include: {
          borrower: true,
          lender: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      res.json({
        success: true,
        loans: loans.map(loan => ({
          id: loan.id,
          borrower: loan.borrower.walletAddress,
          lender: loan.lender?.walletAddress,
          principal: Number(loan.principal) / 1_000000,
          collateral: Number(loan.collateral) / 1_000000,
          interestRate: loan.interestRate,
          duration: loan.duration,
          status: loan.status,
          createdAt: loan.createdAt,
          fundedAt: loan.fundedAt,
          dueAt: loan.dueAt,
        })),
      });
    } catch (error) {
      console.error('Get loans error:', error);
      res.status(500).json({ error: 'Failed to fetch loans' });
    }
  }

  /**
   * Get loan by ID
   */
  async getLoan(req: Request, res: Response) {
    try {
      const { loanId } = req.params;

      const loan = await prisma.loan.findUnique({
        where: { id: loanId },
        include: {
          borrower: true,
          lender: true,
          transactions: true,
        },
      });

      if (!loan) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      res.json({
        success: true,
        loan: {
          id: loan.id,
          borrower: {
            address: loan.borrower.walletAddress,
            creditScore: loan.borrower.creditScore,
            reputationPoints: loan.borrower.reputationPoints,
          },
          lender: loan.lender ? {
            address: loan.lender.walletAddress,
          } : null,
          principal: Number(loan.principal) / 1_000000,
          collateral: Number(loan.collateral) / 1_000000,
          interestRate: loan.interestRate,
          duration: loan.duration,
          status: loan.status,
          createdAt: loan.createdAt,
          fundedAt: loan.fundedAt,
          claimedAt: loan.claimedAt,
          repaidAt: loan.repaidAt,
          dueAt: loan.dueAt,
          txHash: loan.txHash,
          transactions: loan.transactions,
        },
      });
    } catch (error) {
      console.error('Get loan error:', error);
      res.status(500).json({ error: 'Failed to fetch loan' });
    }
  }
}