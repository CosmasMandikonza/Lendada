import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 40, text }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className="animate-spin text-cardano-blue" size={size} />
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );
};
