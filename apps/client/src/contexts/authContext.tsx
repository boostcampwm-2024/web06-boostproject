import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';

export interface AuthContext {
  isAuthenticated: boolean;
  login: (username: string, accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  username: string;
  accessToken: string;
}

export const AUTH_STORAGE_KEY = 'auth_context';

export const initialAuthContext: AuthContext = {
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  username: '',
  accessToken: '',
};

const loadInitialState = () => {
  const savedState = localStorage.getItem(AUTH_STORAGE_KEY);
  if (savedState) {
    const { isAuthenticated, username, accessToken } = JSON.parse(savedState);
    return { isAuthenticated, username, accessToken };
  }

  return {
    isAuthenticated: false,
    username: '',
    accessToken: '',
  };
};

const AuthContext = createContext<AuthContext>(initialAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialState = loadInitialState();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialState.isAuthenticated);
  const [username, setUsername] = useState<string>(initialState.username);
  const [accessToken, setAccessToken] = useState<string>(initialState.accessToken);

  useEffect(() => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ isAuthenticated, username, accessToken })
    );
  }, [isAuthenticated, username, accessToken]);

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
