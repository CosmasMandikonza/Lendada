import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Zap } from 'lucide-react';
import { LoanList } from '@/components/loan/LoanList';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useWallet } from '@/context/WalletContext';
import { apiService } from '@/services/api.service';
import toast from 'react-hot-toast';

export const Lend: React.FC = () => {
  const { connected, address, connectWallet } = useWallet();
  const [loading, setLoading] = useState(false);

  const handleFundLoan = async (loanId: string) => {
    if (!address) return;

    setLoading(true);
    try {
      await apiService.fundLoan(loanId, address);
      toast.success('Loan funded successfully!');
      window.location.reload();
    } catch (error: any) {
      console.error('Fund loan error:', error);
      toast.error(error.response?.data?.error || 'Failed to fund loan');
    } finally {
      setLoading(false);
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
              Connect Your Wallet to Start Lending
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Earn competitive returns by funding loans
            </p>
            <Button size="lg" onClick={connectWallet}>
              Connect Wallet
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            Lend & Earn
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Fund loans and earn competitive interest rates
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <Card className="p-6">
              <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">High Returns</h3>
              <p className="text-sm text-gray-600">
                Earn 5-15% APY depending on loan risk
              </p>
            </Card>
            <Card className="p-6">
              <Shield className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Protected Capital</h3>
              <p className="text-sm text-gray-600">
                150% collateralization protects your investment
              </p>
            </Card>
            <Card className="p-6">
              <Zap className="w-12 h-12 text-purple-500 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Instant Liquidity</h3>
              <p className="text-sm text-gray-600">
                Short-term loans from 7 days to 1 year
              </p>
            </Card>
          </div>
        </div>

        {/* Available Loans */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Available Loans
          </h2>
          <LoanList
            status="PENDING"
            userRole="lender"
            onAction={handleFundLoan}
          />
        </div>
      </motion.div>
    </div>
  );
};
