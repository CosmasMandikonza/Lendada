import React from 'react';
import { motion } from 'framer-motion';
import { LoanRequestForm } from '@/components/loan/LoanRequestForm';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/common/Button';

export const Borrow: React.FC = () => {
  const { connected, connectWallet } = useWallet();

  if (!connected) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Connect Your Wallet to Borrow
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Get instant access to microloans with competitive rates
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
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            Borrow ADA
          </h1>
          <p className="text-xl text-gray-600">
            Get the funds you need with instant approval
          </p>
        </div>

        <LoanRequestForm />

        {/* Benefits Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Fast Approval',
              description: 'Get your credit score and loan approval in under 60 seconds',
            },
            {
              title: 'Flexible Terms',
              description: 'Choose from 7 days to 1 year loan durations',
            },
            {
              title: 'Build Credit',
              description: 'Improve your on-chain credit score with each repayment',
            },
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="bg-blue-50 p-6 rounded-xl border border-blue-200"
            >
              <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};