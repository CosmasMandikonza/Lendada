import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useWallet } from '@/context/WalletContext';
import { apiService } from '@/services/api.service';
import { LOAN_DURATIONS, COLLATERAL_RATIO, MIN_LOAN_AMOUNT, MAX_LOAN_AMOUNT } from '@/utils/constants';
import toast from 'react-hot-toast';
import type { CreditScore } from '@/types';

export const LoanRequestForm: React.FC = () => {
  const { address, user } = useWallet();
  const [loading, setLoading] = useState(false);
  const [creditScore, setCreditScore] = useState<CreditScore | null>(null);
  const [formData, setFormData] = useState({
    principal: 100,
    duration: 30,
  });

  useEffect(() => {
    if (address) {
      fetchCreditScore();
    }
  }, [address]);

  const fetchCreditScore = async () => {
    if (!address) return;
    
    try {
      const score = await apiService.getCreditScore(address, formData.principal, formData.duration);
      setCreditScore(score);
    } catch (error) {
      console.error('Failed to fetch credit score:', error);
    }
  };

  const calculateInterest = () => {
    if (!creditScore) return 0;
    const rate = creditScore.suggestedInterestRate / 10000;
    const days = formData.duration;
    return (formData.principal * rate * days) / 365;
  };

  const calculateCollateral = () => {
    return formData.principal * COLLATERAL_RATIO;
  };

  const calculateTotal = () => {
    return formData.principal + calculateInterest();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !user?.hasIdentity) {
      toast.error('Please complete identity verification first');
      return;
    }

    if (!creditScore) {
      toast.error('Please wait for credit score calculation');
      return;
    }

    if (formData.principal > creditScore.maxLoanAmount) {
      toast.error(`Maximum approved loan amount is ${creditScore.maxLoanAmount} ADA`);
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.createLoan({
        borrowerAddress: address,
        principal: formData.principal,
        interestRate: creditScore.suggestedInterestRate,
        duration: formData.duration,
      });

      toast.success('Loan request created successfully!');
      // Redirect to loan details or dashboard
      window.location.href = `/loans/${result.loan.id}`;
    } catch (error: any) {
      console.error('Loan request error:', error);
      toast.error(error.response?.data?.error || 'Failed to create loan request');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.hasIdentity) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Identity Verification Required
          </h3>
          <p className="text-gray-600 mb-6">
            You need to complete identity verification before requesting a loan.
          </p>
          <Button onClick={() => window.location.href = '/dashboard'}>
            Verify Identity
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="flex items-center space-x-3 mb-6">
        <Calculator className="w-8 h-8 text-cardano-blue" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Request a Loan</h2>
          <p className="text-gray-600">Get funds in minutes</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Loan Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan Amount (ADA)
          </label>
          <div className="relative">
            <input
              type="number"
              min={MIN_LOAN_AMOUNT}
              max={creditScore?.maxLoanAmount || MAX_LOAN_AMOUNT}
              step="10"
              value={formData.principal}
              onChange={(e) => {
                setFormData({ ...formData, principal: parseFloat(e.target.value) });
                fetchCreditScore();
              }}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardano-blue focus:border-transparent"
              required
            />
            <span className="absolute right-4 top-3 text-gray-500 text-lg">₳</span>
          </div>
          <input
            type="range"
            min={MIN_LOAN_AMOUNT}
            max={creditScore?.maxLoanAmount || MAX_LOAN_AMOUNT}
            step="10"
            value={formData.principal}
            onChange={(e) => {
              setFormData({ ...formData, principal: parseFloat(e.target.value) });
              fetchCreditScore();
            }}
            className="w-full mt-2"
          />
          {creditScore && (
            <p className="text-sm text-gray-600 mt-1">
              Max approved: {creditScore.maxLoanAmount.toLocaleString()} ₳
            </p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan Duration
          </label>
          <select
            value={formData.duration}
            onChange={(e) => {
              setFormData({ ...formData, duration: parseInt(e.target.value) });
              fetchCreditScore();
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardano-blue focus:border-transparent"
            required
          >
            {LOAN_DURATIONS.map((duration) => (
              <option key={duration.value} value={duration.value}>
                {duration.label}
              </option>
            ))}
          </select>
        </div>

        {/* Loan Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-4">Loan Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Principal Amount</span>
              <span className="font-semibold text-gray-900">
                {formData.principal.toLocaleString()} ₳
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interest ({creditScore ? (creditScore.suggestedInterestRate / 100).toFixed(2) : '---'}%)</span>
              <span className="font-semibold text-gray-900">
                {calculateInterest().toFixed(2)} ₳
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Collateral Required (150%)</span>
              <span className="font-semibold text-yellow-700">
                {calculateCollateral().toFixed(2)} ₳
              </span>
            </div>
            <div className="border-t border-blue-300 pt-3 flex justify-between">
              <span className="font-semibold text-gray-900">Total Repayment</span>
              <span className="font-bold text-cardano-blue text-xl">
                {calculateTotal().toFixed(2)} ₳
              </span>
            </div>
          </div>
        </div>

        {/* Credit Score Info */}
        {creditScore && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-medium mb-1">
                  Credit Score: {creditScore.score} ({creditScore.riskLevel.toUpperCase()})
                </p>
                <p>{creditScore.recommendation}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-900">
              <p className="font-medium mb-1">Important Notice</p>
              <ul className="list-disc list-inside space-y-1">
                <li>You must lock {calculateCollateral().toFixed(2)} ₳ as collateral</li>
                <li>Collateral will be returned upon full repayment</li>
                <li>Late repayment may result in collateral liquidation</li>
                <li>Your reputation score will be updated based on repayment</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          disabled={!creditScore}
          className="w-full"
          size="lg"
        >
          Request Loan
        </Button>
      </form>
    </Card>
  );
};
