import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Shield, Calendar } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { formatADA, formatDateShort, getDaysRemaining, formatPercentage } from '@/utils/formatters';
import { STATUS_COLORS } from '@/utils/constants';
import type { Loan } from '@/types';

interface LoanCardProps {
  loan: Loan;
  onAction?: (loanId: string, action: string) => void;
  userRole?: 'borrower' | 'lender' | 'viewer';
}

export const LoanCard: React.FC<LoanCardProps> = ({ loan, onAction, userRole = 'viewer' }) => {
  const daysRemaining = loan.status === 'ACTIVE' ? getDaysRemaining(loan.dueAt) : null;
  const isOverdue = daysRemaining !== null && daysRemaining < 0;

  return (
    <Card hover className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900">
              {formatADA(loan.principal)} ₳
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[loan.status]}`}>
              {loan.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Interest: {formatPercentage(loan.interestRate)}
          </p>
        </div>
        {loan.status === 'ACTIVE' && daysRemaining !== null && (
          <div className={`text-right ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
            <Clock className="w-5 h-5 inline mb-1" />
            <p className="text-sm font-medium">
              {isOverdue ? 'OVERDUE' : `${daysRemaining} days left`}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Shield className="w-4 h-4" />
          <div>
            <p className="text-xs text-gray-500">Collateral</p>
            <p className="font-medium text-gray-900">{formatADA(loan.collateral)} ₳</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <div>
            <p className="text-xs text-gray-500">Duration</p>
            <p className="font-medium text-gray-900">{loan.duration} days</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Created</span>
          <span className="text-gray-900">{formatDateShort(loan.createdAt)}</span>
        </div>
        {loan.fundedAt && (
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Funded</span>
            <span className="text-gray-900">{formatDateShort(loan.fundedAt)}</span>
          </div>
        )}
        {loan.status === 'ACTIVE' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Due Date</span>
            <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}>
              {formatDateShort(loan.dueAt)}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {onAction && (
        <div className="mt-4 space-y-2">
          {loan.status === 'PENDING' && userRole === 'lender' && (
            <Button
              onClick={() => onAction(loan.id, 'fund')}
              className="w-full"
              icon={<TrendingUp size={16} />}
            >
              Fund This Loan
            </Button>
          )}

          {loan.status === 'FUNDED' && userRole === 'borrower' && (
            <Button
              onClick={() => onAction(loan.id, 'claim')}
              className="w-full"
            >
              Claim Funds
            </Button>
          )}

          {loan.status === 'ACTIVE' && userRole === 'borrower' && (
            <Button
              onClick={() => onAction(loan.id, 'repay')}
              className="w-full"
              variant={isOverdue ? 'danger' : 'primary'}
            >
              {isOverdue ? 'Repay Now (Overdue)' : 'Repay Loan'}
            </Button>
          )}

          <Button
            onClick={() => window.location.href = `/loans/${loan.id}`}
            variant="outline"
            className="w-full"
          >
            View Details
          </Button>
        </div>
      )}
    </Card>
  );
};