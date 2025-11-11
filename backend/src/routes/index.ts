import { Router } from 'express';
import { LoanController } from '../controllers/loan.controller';
import { IdentityController } from '../controllers/identity.controller';
import { ReputationController } from '../controllers/reputation.controller';

const router = Router();

const loanController = new LoanController();
const identityController = new IdentityController();
const reputationController = new ReputationController();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Identity routes
router.post('/identity/create', identityController.createIdentity);
router.post('/identity/verify', identityController.verifyIdentity);
router.get('/identity/:walletAddress', identityController.getIdentity);

// Credit & Reputation routes
router.get('/credit/:walletAddress', reputationController.getCreditScore);
router.get('/reputation/:walletAddress', reputationController.getReputation);

// Loan routes
router.post('/loans', loanController.createLoan);
router.get('/loans', loanController.getLoans);
router.get('/loans/:loanId', loanController.getLoan);
router.post('/loans/:loanId/fund', loanController.fundLoan);
router.post('/loans/:loanId/claim', loanController.claimLoan);
router.post('/loans/:loanId/repay', loanController.repayLoan);

export default router;