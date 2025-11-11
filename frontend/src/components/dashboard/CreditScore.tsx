import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useWallet } from '@/context/WalletContext';
import { apiService } from '@/services/api.service';
import { RISK_COLORS } from '@/utils/constants';
import type { CreditScore as CreditScoreType } from '@/types';

export const CreditScore: React.FC = () => {
  const { address } = useWallet();
  const [creditScore, setCreditScore] = useState<CreditScoreType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCreditScore = async () => {
    if (!address) return;
    
    try {
      const score = await apiService.getCreditScore(address);
      setCreditScore(score);
    } catch (error) {
      console.error('Failed to fetch credit score:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCreditScore();
  }, [address]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCreditScore();
  };

  if (loading) {
    return (
      <Card className="p-6">
        <LoadingSpinner text="Calculating credit score..." />
      </Card>
    );
  }

  if (!creditScore) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No credit score available</p>
          <Button onClick={handleRefresh} loading={refreshing}>
            Calculate Score
          </Button>
        </div>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-green-600';
    if (score >= 650) return 'text-yellow-600';
    if (score >= 550) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScorePercentage = (score: number) => {
    return ((score - 300) / 550) * 100;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Credit Score</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          loading={refreshing}
          icon={<RefreshCw size={16} />}
        >
          Refresh
        </Button>
      </div>

      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className={`text-7xl font-bold ${getScoreColor(creditScore.score)} mb-2`}
        >
          {creditScore.score}
        </motion.div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${RISK_COLORS[creditScore.riskLevel]}`}>
          {creditScore.riskLevel.toUpperCase()} RISK
        </div>

        {/* Score Bar */}
        <div className="mt-6 w-full bg-gray-200 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${getScorePercentage(creditScore.score)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-3 rounded-full ${
              creditScore.score >= 750
                ? 'bg-green-500'
                : creditScore.score >= 650
                ? 'bg-yellow-500'
                : creditScore.score >= 550
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>300</span>
          <span>850</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Max Loan Amount</p>
          <p className="text-2xl font-bold text-cardano-blue">
            {creditScore.maxLoanAmount.toLocaleString()} ₳
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Interest Rate</p>
          <p className="text-2xl font-bold text-purple-600">
            {(creditScore.suggestedInterestRate / 100).toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Credit Factors</h4>
        {creditScore.factors.map((factor, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              {factor.impact === 'positive' && (
                <TrendingUp className="w-5 h-5 text-green-500" />
              )}
              {factor.impact === 'negative' && (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
              {factor.impact === 'neutral' && (
                <Minus className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium text-gray-900">{factor.name}</p>
                <p className="text-sm text-gray-600">{factor.value}</p>
              </div>
            </div>
            <span
              className={`text-sm font-medium ${
                factor.impact === 'positive'
                  ? 'text-green-600'
                  : factor.impact === 'negative'
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              {factor.weight > 0 ? '+' : ''}
              {factor.weight}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">{creditScore.recommendation}</p>
      </div>
    </Card>
  );
};