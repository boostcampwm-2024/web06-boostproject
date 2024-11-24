import { useContext } from 'react';

import { AuthContext } from '@/features/auth/AuthProvider.tsx';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
