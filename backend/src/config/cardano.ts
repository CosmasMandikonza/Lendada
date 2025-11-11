import { BlockfrostProvider, MeshWallet } from '@meshsdk/core';

export const blockfrostProvider = new BlockfrostProvider(
  process.env.BLOCKFROST_API_KEY || ''
);

export const CARDANO_NETWORK = process.env.CARDANO_NETWORK || 'preprod';

export const CONTRACT_ADDRESSES = {
  loanEscrow: process.env.LOAN_ESCROW_ADDRESS || '',
  identityNFT: process.env.IDENTITY_NFT_POLICY || '',
  reputationToken: process.env.REPUTATION_TOKEN_POLICY || '',
};

export const COLLATERAL_RATIO = 15000; // 150% in basis points
export const MIN_LOAN_AMOUNT = 10_000000; // 10 ADA
export const MAX_LOAN_AMOUNT = 100000_000000; // 100,000 ADA
export const MIN_LOAN_DURATION = 7; // days
export const MAX_LOAN_DURATION = 365; // days