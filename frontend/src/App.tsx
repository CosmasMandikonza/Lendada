import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from '@/context/WalletContext';
import { Header } from '@/components/layout/Header';
import { Home } from '@/pages/Home';
import { Borrow } from '@/pages/Borrow';
import { Lend } from '@/pages/Lend';
import { Dashboard } from '@/pages/Dashboard';
import { LoanDetail } from '@/pages/LoanDetail';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/borrow" element={<Borrow />} />
              <Route path="/lend" element={<Lend />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/loans/:loanId" element={<LoanDetail />} />
            </Routes>
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#0ea5e9',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;