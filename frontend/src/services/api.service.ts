import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';
import type { User, Loan, CreditScore, KYCData } from '@/types';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Identity
  async createIdentity(walletAddress: string, kycData: KYCData, kycLevel: number) {
    const response = await api.post('/identity/create', {
      walletAddress,
      kycData,
      kycLevel,
    });
    return response.data;
  },

  async getIdentity(walletAddress: string): Promise<User> {
    const response = await api.get(`/identity/${walletAddress}`);
    return response.data.identity;
  },

  async verifyIdentity(walletAddress: string, proof: any, publicSignals: any) {
    const response = await api.post('/identity/verify', {
      walletAddress,
      proof,
      publicSignals,
    });
    return response.data;
  },

  // Credit & Reputation
  async getCreditScore(walletAddress: string, loanAmount?: number, duration?: number): Promise<CreditScore> {
    const params = new URLSearchParams();
    if (loanAmount) params.append('loanAmount', loanAmount.toString());
    if (duration) params.append('duration', duration.toString());
    
    const response = await api.get(`/credit/${walletAddress}?${params.toString()}`);
    return response.data.creditScore;
  },

  async getReputation(walletAddress: string) {
    const response = await api.get(`/reputation/${walletAddress}`);
    return response.data.reputation;
  },

  // Loans
  async createLoan(data: {
    borrowerAddress: string;
    principal: number;
    interestRate?: number;
    duration: number;
  }) {
    const response = await api.post('/loans', data);
    return response.data;
  },

  async getLoans(filters?: { status?: string; userAddress?: string }): Promise<Loan[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.userAddress) params.append('userAddress', filters.userAddress);
    
    const response = await api.get(`/loans?${params.toString()}`);
    return response.data.loans;
  },

  async getLoan(loanId: string): Promise<Loan> {
    const response = await api.get(`/loans/${loanId}`);
    return response.data.loan;
  },

  async fundLoan(loanId: string, lenderAddress: string) {
    const response = await api.post(`/loans/${loanId}/fund`, { lenderAddress });
    return response.data;
  },

  async claimLoan(loanId: string, borrowerAddress: string) {
    const response = await api.post(`/loans/${loanId}/claim`, { borrowerAddress });
    return response.data;
  },

  async repayLoan(loanId: string, borrowerAddress: string, amount: number) {
    const response = await api.post(`/loans/${loanId}/repay`, {
      borrowerAddress,
      amount,
    });
    return response.data;
  },
};
