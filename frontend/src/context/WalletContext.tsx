import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserWallet } from '@meshsdk/core';
import { apiService } from '@/services/api.service';
import type { User } from '@/types';
import toast from 'react-hot-toast';

interface WalletContextType {
  wallet: BrowserWallet | null;
  connected: boolean;
  connecting: boolean;
  address: string | null;
  user: User | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshUser: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<BrowserWallet | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const connectWallet = async () => {
    setConnecting(true);
    try {
      const availableWallets = BrowserWallet.getInstalledWallets();
      
      if (availableWallets.length === 0) {
        toast.error('No Cardano wallet found. Please install Nami, Eternl, or Flint.');
        return;
      }

      // Try to connect to the first available wallet
      const walletInstance = await BrowserWallet.enable(availableWallets[0].name);
      setWallet(walletInstance);

      const usedAddresses = await walletInstance.getUsedAddresses();
      const walletAddress = usedAddresses[0];
      setAddress(walletAddress);
      setConnected(true);

      toast.success('Wallet connected successfully!');

      // Fetch user data
      try {
        const userData = await apiService.getIdentity(walletAddress);
        setUser(userData);
      } catch (error) {
        // User doesn't exist yet, that's okay
        console.log('User not found, needs to complete onboarding');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setConnected(false);
    setAddress(null);
    setUser(null);
    toast.success('Wallet disconnected');
  };

  const refreshUser = async () => {
    if (!address) return;
    
    try {
      const userData = await apiService.getIdentity(address);
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connected,
        connecting,
        address,
        user,
        connectWallet,
        disconnectWallet,
        refreshUser,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};