import {
  BlockfrostProvider,
  MeshWallet,
  Transaction,
  deserializeAddress,
  serializePlutusScript,
  mConStr0,
  mConStr1,
} from '@meshsdk/core';
import { blockfrostProvider, CONTRACT_ADDRESSES } from '../config/cardano';
import prisma from '../config/database';

export class BlockchainService {
  private provider: BlockfrostProvider;

  constructor() {
    this.provider = blockfrostProvider;
  }

  /**
   * Create a loan escrow on-chain
   */
  async createLoan(
    borrowerAddress: string,
    principal: number,
    interestRate: number,
    duration: number,
    collateral: number,
    identityNFT: { policyId: string; assetName: string },
    minCreditScore: number
  ): Promise<{ txHash: string; utxoRef: string }> {
    const wallet = await this.getWallet(borrowerAddress);

    // Build loan datum
    const loanDatum = {
      borrower: deserializeAddress(borrowerAddress).pubKeyHash,
      lender: mConStr0([]), // None
      principal: principal * 1_000000, // Convert to lovelace
      interest_rate: interestRate,
      duration: duration * 86400000, // Convert days to milliseconds
      collateral: collateral * 1_000000,
      created_at: Date.now(),
      funded_at: mConStr0([]),
      due_at: Date.now() + duration * 86400000,
      status: mConStr0([]), // Pending
      identity_nft: [identityNFT.policyId, identityNFT.assetName],
      min_credit_score: minCreditScore,
    };

    // Build transaction
    const tx = new Transaction({ initiator: wallet });
    tx.sendLovelace(
      {
        address: CONTRACT_ADDRESSES.loanEscrow,
        datum: { value: loanDatum },
      },
      (collateral * 1_000000).toString()
    );

    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    return {
      txHash,
      utxoRef: `${txHash}#0`,
    };
  }

  /**
   * Fund a loan as a lender
   */
  async fundLoan(
    lenderAddress: string,
    loanUtxo: string,
    principal: number
  ): Promise<string> {
    const wallet = await this.getWallet(lenderAddress);

    const tx = new Transaction({ initiator: wallet });
    
    // Add loan UTxO as input
    tx.redeemValue({
      value: { script: CONTRACT_ADDRESSES.loanEscrow },
      datum: loanUtxo,
      redeemer: { data: mConStr0([]) }, // Fund redeemer
    });

    // Send principal to contract
    tx.sendLovelace(
      CONTRACT_ADDRESSES.loanEscrow,
      (principal * 1_000000).toString()
    );

    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    return txHash;
  }

  /**
   * Claim loan as borrower
   */
  async claimLoan(
    borrowerAddress: string,
    loanUtxo: string
  ): Promise<string> {
    const wallet = await this.getWallet(borrowerAddress);

    const tx = new Transaction({ initiator: wallet });
    
    tx.redeemValue({
      value: { script: CONTRACT_ADDRESSES.loanEscrow },
      datum: loanUtxo,
      redeemer: { data: mConStr1([]) }, // Claim redeemer
    });

    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    return txHash;
  }

  /**
   * Repay loan
   */
  async repayLoan(
    borrowerAddress: string,
    loanUtxo: string,
    amount: number
  ): Promise<string> {
    const wallet = await this.getWallet(borrowerAddress);

    const tx = new Transaction({ initiator: wallet });
    
    tx.redeemValue({
      value: { script: CONTRACT_ADDRESSES.loanEscrow },
      datum: loanUtxo,
      redeemer: { 
        data: {
          constructor: 2, // Repay
          fields: [{ int: amount * 1_000000 }]
        }
      },
    });

    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    return txHash;
  }

  /**
   * Mint identity NFT with ZK proof
   */
  async mintIdentityNFT(
    ownerAddress: string,
    zkProofHash: string,
    kycLevel: number,
    countryCode: string
  ): Promise<{ txHash: string; assetName: string }> {
    const wallet = await this.getWallet(ownerAddress);

    const assetName = `LendADA_ID_${Date.now()}`;

    const metadata = {
      owner: deserializeAddress(ownerAddress).pubKeyHash,
      zk_proof_hash: zkProofHash,
      created_at: Date.now(),
      kyc_level: kycLevel,
      country_code: countryCode,
    };

    const tx = new Transaction({ initiator: wallet });
    
    tx.mintAsset(
      CONTRACT_ADDRESSES.identityNFT,
      {
        assetName,
        assetQuantity: '1',
        metadata,
        label: '721',
        recipient: ownerAddress,
      }
    );

    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    return { txHash, assetName };
  }

  /**
   * Update reputation after loan repayment
   */
  async updateReputation(
    userAddress: string,
    loanAmount: number,
    repaymentTime: number,
    dueTime: number
  ): Promise<string> {
    const wallet = await this.getWallet(userAddress);

    const tx = new Transaction({ initiator: wallet });
    
    tx.mintAsset(
      CONTRACT_ADDRESSES.reputationToken,
      {
        assetName: 'LendADA_REP',
        assetQuantity: '1',
        metadata: {
          loan_amount: loanAmount,
          repayment_time: repaymentTime,
          due_time: dueTime,
        },
        label: '721',
        recipient: userAddress,
      }
    );

    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    return txHash;
  }

  /**
   * Get wallet instance (simplified - in production use proper wallet management)
   */
  private async getWallet(address: string): Promise<MeshWallet> {
    // In production, this would retrieve the user's wallet connection
    // For demo purposes, we'll use a service wallet
    const mnemonic = process.env.SERVICE_WALLET_MNEMONIC || '';
    return new MeshWallet({
      networkId: 0, // 0 for testnet, 1 for mainnet
      fetcher: this.provider,
      submitter: this.provider,
      key: {
        type: 'mnemonic',
        words: mnemonic.split(' '),
      },
    });
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash: string): Promise<any> {
    try {
      const tx = await this.provider.fetchTxInfo(txHash);
      return tx;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get UTxO details
   */
  async getUtxo(utxoRef: string): Promise<any> {
    const [txHash, index] = utxoRef.split('#');
    try {
      const utxos = await this.provider.fetchUTxOs(txHash);
      return utxos.find((u: any) => u.output_index === parseInt(index));
    } catch (error) {
      return null;
    }
  }
}
