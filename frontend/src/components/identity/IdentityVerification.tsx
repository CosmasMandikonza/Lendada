import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useWallet } from '@/context/WalletContext';
import { apiService } from '@/services/api.service';
import toast from 'react-hot-toast';
import type { KYCData } from '@/types';

export const IdentityVerification: React.FC = () => {
  const { address, refreshUser } = useWallet();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [kycData, setKycData] = useState<KYCData>({
    name: '',
    dateOfBirth: '',
    country: '',
    idNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setLoading(true);
    try {
      // In production, this would integrate with a real KYC provider
      const result = await apiService.createIdentity(address, kycData, 3);
      
      toast.success('Identity verified successfully!');
      await refreshUser();
      setStep(3);
    } catch (error) {
      console.error('Identity verification error:', error);
      toast.error('Failed to verify identity');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <Card className="p-8 max-w-md mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Identity Verified!
          </h3>
          <p className="text-gray-600 mb-6">
            Your identity NFT has been minted with zero-knowledge proof.
            You can now borrow from the platform.
          </p>
          <Button onClick={() => window.location.href = '/borrow'}>
            Start Borrowing
          </Button>
        </motion.div>
      </Card>
    );
  }

  return (
    <Card className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="w-8 h-8 text-cardano-blue" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Identity Verification
          </h2>
          <p className="text-gray-600">
            Complete KYC with zero-knowledge privacy
          </p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s
                    ? 'bg-cardano-blue text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-cardano-blue' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm">
          <span className={step >= 1 ? 'text-cardano-blue font-medium' : 'text-gray-500'}>
            Personal Info
          </span>
          <span className={step >= 2 ? 'text-cardano-blue font-medium' : 'text-gray-500'}>
            ZK Proof
          </span>
          <span className={step >= 3 ? 'text-cardano-blue font-medium' : 'text-gray-500'}>
            Complete
          </span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Privacy-First Verification</p>
            <p>
              Your personal data is never stored on-chain. We generate a
              zero-knowledge proof that verifies your identity without
              revealing any personal information.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            required
            value={kycData.name}
            onChange={(e) => setKycData({ ...kycData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardano-blue focus:border-transparent"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            required
            value={kycData.dateOfBirth}
            onChange={(e) =>
              setKycData({ ...kycData, dateOfBirth: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardano-blue focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <select
            required
            value={kycData.country}
            onChange={(e) => setKycData({ ...kycData, country: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardano-blue focus:border-transparent"
          >
            <option value="">Select country</option>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="JP">Japan</option>
            <option value="SG">Singapore</option>
            {/* Add more countries */}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID Number (Passport/Driver's License)
          </label>
          <input
            type="text"
            required
            value={kycData.idNumber}
            onChange={(e) =>
              setKycData({ ...kycData, idNumber: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardano-blue focus:border-transparent"
            placeholder="ABC123456"
          />
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full"
          size="lg"
        >
          Verify Identity & Mint NFT
        </Button>
      </form>
    </Card>
  );
};
