import { Router } from 'express';
const router = Router();

// Health
router.get('/health', (_req, res) => res.json({ status: 'healthy', ts: new Date().toISOString() }));

// TODO: Wire actual controllers once you paste them.
// router.post('/identity/create', identityController.createIdentity);
// router.post('/identity/verify', identityController.verifyIdentity);
// router.get('/identity/:walletAddress', identityController.getIdentity);
// router.get('/credit/:walletAddress', reputationController.getCreditScore);
// router.get('/reputation/:walletAddress', reputationController.getReputation);
// router.post('/loans', loanController.createLoan);
// router.get('/loans', loanController.getLoans);
// router.get('/loans/:loanId', loanController.getLoan);
// router.post('/loans/:loanId/fund', loanController.fundLoan);
// router.post('/loans/:loanId/claim', loanController.claimLoan);
// router.post('/loans/:loanId/repay', loanController.repayLoan);

export default router;
