import { Request, Response } from 'express';
import prisma from '../config/database';
import { BlockchainService } from '../services/blockchain.service';
import { ZKProofService } from '../services/zk-proof.service';

const blockchainService = new BlockchainService();
const zkProofService = new ZKProofService();

export class IdentityController {
  /**
   * Create identity NFT with ZK proof
   */
  async createIdentity(req: Request, res: Response) {
    try {
      const {
        walletAddress,
        kycData,
        kycLevel,
      } = req.body;

      // Generate ZK proof
      const { proof, publicSignals, proofHash } = await zkProofService.generateProof(kycData);

      // Mint identity NFT on-chain
      const { txHash, assetName } = await blockchainService.mintIdentityNFT(
        walletAddress,
        proofHash,
        kycLevel,
        kycData.country
      );

      // Create or update user
      const user = await prisma.user.upsert({
        where: { walletAddress },
        update: {
          identityNFT: `${process.env.IDENTITY_NFT_POLICY}.${assetName}`,
          zkProofHash: proofHash,
          kycLevel,
        },
        create: {
          walletAddress,
          identityNFT: `${process.env.IDENTITY_NFT_POLICY}.${assetName}`,
          zkProofHash: proofHash,
          kycLevel,
        },
      });

      // Record transaction
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'IDENTITY_MINT',
          amount: BigInt(0),
          txHash,
          status: 'confirmed',
          metadata: {
            assetName,
            kycLevel,
          },
        },
      });

      res.json({
        success: true,
        identity: {
          nft: `${process.env.IDENTITY_NFT_POLICY}.${assetName}`,
          proofHash,
          kycLevel,
          txHash,
        },
      });
    } catch (error) {
      console.error('Create identity error:', error);
      res.status(500).json({ error: 'Failed to create identity' });
    }
  }

  /**
   * Verify identity proof
   */
  async verifyIdentity(req: Request, res: Response) {
    try {
      const { walletAddress, proof, publicSignals } = req.body;

      const user = await prisma.user.findUnique({
        where: { walletAddress },
      });

      if (!user || !user.zkProofHash) {
        return res.status(404).json({ error: 'Identity not found' });
      }

      const isValid = await zkProofService.verifyProof(
        proof,
        publicSignals,
        user.zkProofHash
      );

      res.json({
        success: true,
        valid: isValid,
        kycLevel: user.kycLevel,
      });
    } catch (error) {
      console.error('Verify identity error:', error);
      res.status(500).json({ error: 'Failed to verify identity' });
    }
  }

  /**
   * Get user identity
   */
  async getIdentity(req: Request, res: Response) {
    try {
      const { walletAddress } = req.params;

      const user = await prisma.user.findUnique({
        where: { walletAddress },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        identity: {
          walletAddress: user.walletAddress,
          identityNFT: user.identityNFT,
          kycLevel: user.kycLevel,
          creditScore: user.creditScore,
          reputationPoints: user.reputationPoints,
          hasIdentity: !!user.identityNFT,
        },
      });
    } catch (error) {
      console.error('Get identity error:', error);
      res.status(500).json({ error: 'Failed to fetch identity' });
    }
  }
}
