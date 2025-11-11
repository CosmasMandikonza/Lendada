import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, User, TrendingUp, LayoutDashboard } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/common/Button';
import { formatAddress } from '@/utils/formatters';

export const Header: React.FC = () => {
  const { connected, address, user, connectWallet, disconnectWallet } = useWallet();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: TrendingUp },
    { path: '/borrow', label: 'Borrow', icon: TrendingUp },
    { path: '/lend', label: 'Lend', icon: Wallet },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-to-br from-cardano-blue to-cardano-cyan rounded-lg flex items-center justify-center"
            >
              <span className="text-white font-bold text-xl">L</span>
            </motion.div>
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-cardano-blue to-primary-600 bg-clip-text text-transparent">
              LendADA
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    isActive
                      ? 'bg-cardano-blue/10 text-cardano-blue'
                      : 'text-gray-600 hover:text-cardano-blue hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {connected && user && (
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                <User size={16} className="text-green-600" />
                <span className="text-sm text-green-700">
                  Score: <span className="font-bold">{user.creditScore}</span>
                </span>
              </div>
            )}

            {connected ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:block px-4 py-2 bg-gray-100 rounded-lg">
                  <p className="text-sm font-mono text-gray-700">
                    {formatAddress(address!)}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={connectWallet} icon={<Wallet size={18} />}>
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};