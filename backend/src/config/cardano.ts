export const CARDANO_NETWORK = process.env.CARDANO_NETWORK || 'preprod';
export const CONTRACT_ADDRESSES = {
  loanEscrow: process.env.LOAN_ESCROW_ADDRESS || '',
  identityNFT: process.env.IDENTITY_NFT_POLICY || '',
  reputationToken: process.env.REPUTATION_TOKEN_POLICY || '',
};
export const COLLATERAL_RATIO = 15000; // basis points
export const MIN_LOAN_AMOUNT = 10_000000;
export const MAX_LOAN_AMOUNT = 100000_000000;
export const MIN_LOAN_DURATION = 7;
export const MAX_LOAN_DURATION = 365;
