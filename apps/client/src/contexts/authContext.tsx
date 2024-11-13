import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

export interface AuthContext {
  isAuthenticated: boolean;
  login: (username: string, accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  username: string;
  accessToken: string;
}

export const initialAuthContext: AuthContext = {
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  username: '',
  accessToken: '',
};

const AuthContext = createContext<AuthContext>(initialAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');

  const login = useCallback(async (username: string, accessToken: string) => {
    setIsAuthenticated(true);
    setUsername(username);
    setAccessToken(accessToken);
  }, []);

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    setUsername('');
    setAccessToken('');
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      login,
      logout,
      username,
      accessToken,
    }),
    [isAuthenticated, login, logout, username, accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
