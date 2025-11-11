export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const LOAN_DURATIONS = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
  { value: 180, label: '6 months' },
  { value: 365, label: '1 year' },
];

export const COLLATERAL_RATIO = 1.5; // 150%

export const MIN_LOAN_AMOUNT = 10;
export const MAX_LOAN_AMOUNT = 100000;

export const RISK_COLORS = {
  low: 'text-green-600 bg-green-100',
  medium: 'text-yellow-600 bg-yellow-100',
  high: 'text-orange-600 bg-orange-100',
  'very-high': 'text-red-600 bg-red-100',
};

export const STATUS_COLORS = {
  PENDING: 'text-blue-600 bg-blue-100',
  FUNDED: 'text-purple-600 bg-purple-100',
  ACTIVE: 'text-indigo-600 bg-indigo-100',
  REPAID: 'text-green-600 bg-green-100',
  DEFAULTED: 'text-red-600 bg-red-100',
  CANCELLED: 'text-gray-600 bg-gray-100',
};