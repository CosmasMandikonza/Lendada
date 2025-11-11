export const formatADA = (lovelace: number): string => {
  const ada = lovelace / 1_000000;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(ada);
};

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
};

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const formatDateShort = (date: Date | string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
};

export const getDaysRemaining = (dueDate: Date | string): number => {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const formatPercentage = (value: number): string => {
  return `${(value / 100).toFixed(2)}%`;
};