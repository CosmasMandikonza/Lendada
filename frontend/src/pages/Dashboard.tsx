import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Award, Shield } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { CreditScore } from '@/components/dashboard/CreditScore';
import { LoanList } from '@/components/loan/LoanList';
import { IdentityVerification } from '@/components/identity/IdentityVerification';
import { useWallet } from '@/context/WalletContext';
import { apiService } from '@/services/api.service';
import { formatAddress } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const { connected, address, user, connectWallet } = useWallet();
  const navigate = useNavigate();
  const [reputation, setReputation] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'borrowed' | 'lent'>('borrowed');

  useEffect(() => {
    if (address) {
      fetchReputation();
    }
  }, [address]);

  const fetchReputation = async () => {
    if (!address) return;
    
    try {
      const rep = await apiService.getReputation(address);
      setReputation(rep);
    } catch (error) {
      console.error('Failed to fetch reputation:', error);
    }
  };

  const handleLoanAction = async (loanId: string, action: string) => {
    if (!address) return;

    try {
      if (action === 'claim') {
        await apiService.claimLoan(loanId, address);
        toast.success('Funds claimed successfully!');
      } else if (action === 'repay') {
        // Navigate to loan detail for repayment
        navigate(`/loans/${loanId}`);
      }
      window.location.reload();
    } catch (error: any) {
      console.error('Loan action error:', error);
      toast.error(error.response?.data?.error || 'Action failed');
    }
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Connect to View Dashboard
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Track your loans, credit score, and reputation
            </p>
            <Button size="lg" onClick={connectWallet}>
              Connect Wallet
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!user?.hasIdentity) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Welcome to LendADA
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Complete identity verification to get started
            </p>
            <p className="text-sm text-gray-500">
              Connected: {formatAddress(address!)}
            </p>
          </div>

          <IdentityVerification />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            {formatAddress(address!)}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900">
                {user?.creditScore || 0}
              </span>
            </div>
            <p className="text-sm text-gray-600">Credit Score</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold text-gray-900">
                {user?.reputationPoints || 0}
              </span>
            </div>
            <p className="text-sm text-gray-600">Reputation Points</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">
                {reputation?.totalLoans || 0}
              </span>
            </div>
            <p className="text-sm text-gray-600">Total Loans</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900">
                {reputation?.repaymentRate?.toFixed(0) || 0}%
              </span>
            </div>
            <p className="text-sm text-gray-600">Repayment Rate</p>
          </Card>
        </div>

        {/* Credit Score Section */}
        <div className="mb-8">
          <CreditScore />
        </div>

        {/* Loans Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Loans</h2>
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'borrowed' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('borrowed')}
              >
                Borrowed
              </Button>
              <Button
                variant={activeTab === 'lent' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('lent')}
              >
                Lent
              </Button>
            </div>
          </div>

          <LoanList
            userAddress={address}
            userRole={activeTab === 'borrowed' ? 'borrower' : 'lender'}
            onAction={handleLoanAction}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Need Funds?
            </h3>
            <p className="text-gray-600 mb-4">
              Request a loan with instant approval
            </p>
            <Button onClick={() => navigate('/borrow')}>
              Borrow Now
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Want to Earn?
            </h3>
            <p className="text-gray-600 mb-4">
              Fund loans and earn competitive returns
            </p>
            <Button onClick={() => navigate('/lend')}>
              Start Lending
            </Button>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};