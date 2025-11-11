import axios from 'axios';
import { OnChainMetrics } from './types';

const BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY || '';
const BLOCKFROST_URL = 'https://cardano-preprod.blockfrost.io/api/v0';

export class BlockchainDataService {
  private headers = {
    'project_id': BLOCKFROST_API_KEY
  };

  async getOnChainMetrics(address: string): Promise<OnChainMetrics> {
    try {
      // Get address details
      const addressInfo = await this.getAddressInfo(address);
      
      // Get transaction history
      const transactions = await this.getAddressTransactions(address);
      
      // Get staking information
      const stakingInfo = await this.getStakingInfo(address);
      
      // Get UTxO information
      const utxos = await this.getAddressUtxos(address);

      // Calculate metrics
      const metrics = this.calculateMetrics(
        addressInfo,
        transactions,
        stakingInfo,
        utxos
      );

      return metrics;
    } catch (error) {
      console.error('Error fetching blockchain data:', error);
      // Return default metrics if data fetch fails
      return this.getDefaultMetrics();
    }
  }

  private async getAddressInfo(address: string) {
    const response = await axios.get(
      `${BLOCKFROST_URL}/addresses/${address}`,
      { headers: this.headers }
    );
    return response.data;
  }

  private async getAddressTransactions(address: string, limit = 100) {
    const response = await axios.get(
      `${BLOCKFROST_URL}/addresses/${address}/transactions`,
      { 
        headers: this.headers,
        params: { count: limit, order: 'desc' }
      }
    );
    return response.data;
  }

  private async getStakingInfo(address: string) {
    try {
      const response = await axios.get(
        `${BLOCKFROST_URL}/addresses/${address}/total`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }

  private async getAddressUtxos(address: string) {
    const response = await axios.get(
      `${BLOCKFROST_URL}/addresses/${address}/utxos`,
      { headers: this.headers }
    );
    return response.data;
  }

  private calculateMetrics(
    addressInfo: any,
    transactions: any[],
    stakingInfo: any,
    utxos: any[]
  ): OnChainMetrics {
    // Calculate total value transacted
    let totalValueTransacted = 0;
    transactions.forEach(tx => {
      // Sum all transaction amounts
      totalValueTransacted += parseInt(tx.amount || '0');
    });

    // Calculate account age
    const oldestTx = transactions[transactions.length - 1];
    const accountAge = oldestTx 
      ? Math.floor((Date.now() / 1000 - oldestTx.block_time) / 86400)
      : 0;

    // Check for staking activity
    const stakingActivity = stakingInfo?.stake_address !== null;

    // Count NFTs (assets with quantity = 1)
    let nftCount = 0;
    utxos.forEach(utxo => {
      if (utxo.amount) {
        utxo.amount.forEach((asset: any) => {
          if (asset.quantity === '1' && asset.unit !== 'lovelace') {
            nftCount++;
          }
        });
      }
    });

    // Calculate average balance
    const currentBalance = parseInt(addressInfo.amount?.[0]?.quantity || '0');
    const averageBalance = currentBalance; // Simplified

    // Check for consistent activity (transactions in last 30 days)
    const recentTxs = transactions.filter(tx => {
      const daysSince = Math.floor((Date.now() / 1000 - tx.block_time) / 86400);
      return daysSince <= 30;
    });
    const consistentActivity = recentTxs.length >= 3;

    // Count DEX interactions (simplified - looking for multi-asset transactions)
    const dexInteractions = transactions.filter(tx => {
      return tx.asset_count > 2; // Transactions with multiple assets likely DEX swaps
    }).length;

    return {
      totalTransactions: transactions.length,
      totalValueTransacted: totalValueTransacted / 1_000_000, // Convert to ADA
      accountAge,
      stakingActivity,
      nftCount,
      dexInteractions,
      averageBalance: averageBalance / 1_000_000, // Convert to ADA
      consistentActivity
    };
  }

  private getDefaultMetrics(): OnChainMetrics {
    return {
      totalTransactions: 0,
      totalValueTransacted: 0,
      accountAge: 0,
      stakingActivity: false,
      nftCount: 0,
      dexInteractions: 0,
      averageBalance: 0,
      consistentActivity: false
    };
  }
}