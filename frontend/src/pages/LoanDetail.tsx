import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Clock,
  User,
  Shield,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useWallet } from '@/context/WalletContext';
import { apiService } from '@/services/api.service';
import { formatADA, formatAddress, formatDate, getDaysRemaining, formatPercentage } from '@/utils/formatters';
import { STATUS_COLORS } from '@/utils/constants';
import type { Loan } from '@/types';
import toast from 'react-hot-toast';

export const LoanDetail: React.FC = () => {
  const { loanId } = useParams<{ loanId: string }>();
  const navigate = useNavigate();
  const { address } = useWallet();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [repayAmount, setRepayAmount] = useState('');

  useEffect(() => {
    if (loanId) {
      fetchLoan();
    }
  }, [loanId]);

  const fetchLoan = async () => {
    if (!loanId) return;

    try {
      const data = await apiService.getLoan(loanId);
      setLoan(data);
      
      // Set default repay amount to total due
      if (data.status === 'ACTIVE') {
        const interest = (data.principal * data.interestRate * data.duration) / (365 * 10000);
        const total = data.principal + interest;
        setRepayAmount(total.toString());
      }
    } catch (error) {
      console.error('Failed to fetch loan:', error);
      toast.error('Loan not found');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRepay = async () => {
    if (!loan || !address) return;

    setActionLoading(true);
    try {
      await apiService.repayLoan(loan.id, address, parseFloat(repayAmount));
      toast.success('Loan repaid successfully!');
      fetchLoan();
    } catch (error: any) {
      console.error('Repay error:', error);
      toast.error(error.response?.data?.error || 'Failed to repay loan');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingSpinner text="Loading loan details..." />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-600">Loan not found</p>
        </div>
      </div>
    );
  }

  const isBorrower = address?.toLowerCase() === loan.borrower.address.toLowerCase();
  const isLender = address?.toLowerCase() === loan.lender?.address.toLowerCase();
  const daysRemaining = loan.status === 'ACTIVE' ? getDaysRemaining(loan.dueAt) : null;
  const isOverdue = daysRemaining !== null && daysRemaining < 0;

  const calculateInterest = () => {
    return (loan.principal * loan.interestRate * loan.duration) / (365 * 10000);
  };

  const calculateTotal = () => {
    return loan.principal + calculateInterest();
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          icon={<ArrowLeft size={18} />}
          className="mb-6"
        >
          Back to Dashboard
        </Button>

        {/* Loan Header */}
        <Card className="p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Loan Details
              </h1>
              <p className="text-gray-600">ID: {loan.id}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${STATUS_COLORS[loan.status]}`}>
              {loan.status}
            </span>
          </div>

          {/* Loan Amount */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <DollarSign className="w-8 h-8 text-cardano-blue" />
              <div>
                <p className="text-sm text-gray-600">Principal Amount</p>
                <p className="text-4xl font-bold text-gray-900">
                  {formatADA(loan.principal)} ₳
                </p>
              </div>
            </div>
          </div>

          {/* Status Alert */}
          {loan.status === 'ACTIVE' && isOverdue && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-900">
                  <p className="font-medium mb-1">Loan Overdue!</p>
                  <p>
                    This loan is {Math.abs(daysRemaining!)} days overdue. Please repay immediately to avoid collateral liquidation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {loan.status === 'REPAID' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-900">
                  <p className="font-medium">Loan Repaid Successfully</p>
                  <p>Repaid on {formatDate(loan.repaidAt!)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-600">Borrower</p>
              </div>
              <p className="font-medium text-gray-900 font-mono">
                {formatAddress(loan.borrower.address)}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Credit Score: {loan.borrower.creditScore}
              </p>
            </div>

            {loan.lender && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <p className="text-sm text-gray-600">Lender</p>
                </div>
                <p className="font-medium text-gray-900 font-mono">
                  {formatAddress(loan.lender.address)}
                </p>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-600">Collateral</p>
              </div>
              <p className="font-medium text-gray-900">
                {formatADA(loan.collateral)} ₳
              </p>
              <p className="text-xs text-gray-600 mt-1">150% of principal</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-600">Interest Rate</p>
              </div>
              <p className="font-medium text-gray-900">
                {formatPercentage(loan.interestRate)}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-600">Duration</p>
              </div>
              <p className="font-medium text-gray-900">{loan.duration} days</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-600">Created</p>
              </div>
              <p className="font-medium text-gray-900">
                {formatDate(loan.createdAt)}
              </p>
            </div>
          </div>
        </Card>

        {/* Payment Breakdown */}
        <Card className="p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Payment Breakdown
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-lg">
              <span className="text-gray-600">Principal</span>
              <span className="font-semibold text-gray-900">
                {formatADA(loan.principal)} ₳
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-600">Interest</span>
              <span className="font-semibold text-gray-900">
                {calculateInterest().toFixed(2)} ₳
              </span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between text-xl">
              <span className="font-bold text-gray-900">Total Due</span>
              <span className="font-bold text-cardano-blue">
                {calculateTotal().toFixed(2)} ₳
              </span>
            </div>
          </div>

          {loan.status === 'ACTIVE' && daysRemaining !== null && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                {isOverdue ? (
                  <>⚠️ Overdue by {Math.abs(daysRemaining)} days</>
                ) : (
                  <>📅 {daysRemaining} days remaining until due date</>
                )}
              </p>
            </div>
          )}
        </Card>

        {/* Actions */}
        {isBorrower && loan.status === 'ACTIVE' && (
          <Card className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Repay Loan
            </h2>
            <p className="text-gray-600 mb-4">
              Repay your loan to reclaim your collateral and improve your credit score
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repayment Amount (₳)
              </label>
              <input
                type="number"
                step="0.01"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardano-blue focus:border-transparent"
              />
              <p className="text-sm text-gray-600 mt-1">
                Minimum required: {calculateTotal().toFixed(2)} ₳
              </p>
            </div>

            <Button
              onClick={handleRepay}
              loading={actionLoading}
              size="lg"
              className="w-full"
              variant={isOverdue ? 'danger' : 'primary'}
            >
              Repay {repayAmount} ₳
            </Button>
          </Card>
        )}

        {/* Transaction History */}
        {loan.transactions && loan.transactions.length > 0 && (
          <Card className="p-8 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Transaction History
            </h2>
            <div className="space-y-3">
              {loan.transactions.map((tx: any) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{tx.type.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-600">{formatDate(tx.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatADA(Number(tx.amount))} ₳
                    </p>
                    
                      href={`https://preprod.cardanoscan.io/transaction/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cardano-blue hover:underline"
                    >
                      View on Explorer
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
};
