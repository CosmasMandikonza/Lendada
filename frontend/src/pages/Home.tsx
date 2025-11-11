import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Zap, TrendingUp, Users, Lock, Award } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useWallet } from '@/context/WalletContext';

export const Home: React.FC = () => {
  const { connected, connectWallet } = useWallet();

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Privacy-First Identity',
      description: 'Zero-knowledge proofs ensure your personal data never touches the blockchain',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Instant Credit Scoring',
      description: 'AI-powered analysis of on-chain behavior for fair, transparent credit assessment',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Competitive Rates',
      description: 'Lower interest rates than traditional lenders, powered by DeFi efficiency',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Peer-to-Peer Lending',
      description: 'Connect directly with lenders and borrowers, no middlemen required',
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Smart Contract Security',
      description: 'Audited Aiken contracts on Cardano ensure your funds are always safe',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Build Reputation',
      description: 'Earn reputation tokens and improve your credit score with each successful loan',
    },
  ];

  const stats = [
    { label: 'Total Value Locked', value: '₳2.5M' },
    { label: 'Loans Funded', value: '1,234' },
    { label: 'Active Users', value: '3,456' },
    { label: 'Avg. Interest Rate', value: '8.5%' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cardano-blue via-primary-700 to-purple-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-cardano-cyan rounded-full filter blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-400 rounded-full filter blur-3xl animate-pulse-slow" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
              Privacy-First Microloans
              <br />
              <span className="text-cardano-cyan">Powered by Cardano</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Access instant credit with AI-driven scoring, zero-knowledge identity,
              and transparent smart contracts
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {connected ? (
                <>
                  <Link to="/borrow">
                    <Button size="lg" variant="secondary">
                      Borrow Now
                    </Button>
                  </Link>
                  <Link to="/lend">
                    <Button size="lg" variant="outline">
                      Start Lending
                    </Button>
                  </Link>
                </>
              ) : (
                <Button size="lg" onClick={connectWallet}>
                  Connect Wallet to Start
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-cardano-blue mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Why Choose LendADA?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing microfinance with blockchain technology
              and privacy-preserving AI
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="p-6 h-full">
                  <div className="text-cardano-blue mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in three simple steps
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  step: '1',
                  title: 'Verify Your Identity',
                  description: 'Complete KYC verification with zero-knowledge proofs. Your personal data stays private.',
                },
                {
                  step: '2',
                  title: 'Get Your Credit Score',
                  description: 'Our AI analyzes your on-chain behavior to calculate a fair credit score in seconds.',
                },
                {
                  step: '3',
                  title: 'Borrow or Lend',
                  description: 'Request a loan or fund existing loans to earn competitive interest rates.',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="flex items-start space-x-6"
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-cardano-blue to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cardano-blue to-primary-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-display font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of users building their financial future on Cardano
            </p>
            {connected ? (
              <Link to="/dashboard">
                <Button size="lg" variant="secondary">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Button size="lg" onClick={connectWallet} variant="secondary">
                Connect Wallet Now
              </Button>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};
