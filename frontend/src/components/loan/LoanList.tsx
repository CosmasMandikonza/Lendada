import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search } from 'lucide-react';
import { LoanCard } from './LoanCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { apiService } from '@/services/api.service';
import type { Loan, LoanStatus } from '@/types';

interface LoanListProps {
  status?: LoanStatus;
  userAddress?: string;
  userRole?: 'borrower' | 'lender' | 'viewer';
  onAction?: (loanId: string, action: string) => void;
}

export const LoanList: React.FC<LoanListProps> = ({
  status,
  userAddress,
  userRole,
  onAction,
}) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LoanStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLoans();
  }, [status, userAddress]);

  const fetchLoans = async () => {
    try {
      const filters: any = {};
      if (status) filters.status = status;
      if (userAddress) filters.userAddress = userAddress;

      const data = await apiService.getLoans(filters);
      setLoans(data);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLoans = loans.filter((loan) => {
    if (filter !== 'ALL' && loan.status !== filter) return false;
    if (searchTerm) {
      return (
        loan.borrower.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.lender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  if (loading) {
    return <LoadingSpinner text="Loading loans..." />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by address or loan ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardano-blue focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as LoanStatus | 'ALL')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardano-blue focus:border-transparent"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="FUNDED">Funded</option>
            <option value="ACTIVE">Active</option>
            <option value="REPAID">Repaid</option>
            <option value="DEFAULTED">Defaulted</option>
          </select>
        </div>
      </div>

      {/* Loan Grid */}
      {filteredLoans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No loans found</p>
          <p className="text-gray-500 text-sm mt-2">
            {filter !== 'ALL' ? 'Try changing your filters' : 'Be the first to create a loan!'}
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredLoans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              userRole={userRole}
              onAction={onAction}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};
