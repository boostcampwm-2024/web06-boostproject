import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ENV } from '@/config/env';
import {
  AuthState,
  LoginRequestDto,
  LoginResult,
  RegisterRequestDto,
  RegisterResult,
} from '@/features/auth/types.ts';
import { authAPI } from '@/features/auth/api.ts';
import { BaseResponse } from '@/features/types.ts';
import { useToast } from '@/lib/useToast';

export interface AuthContextValue extends AuthState {
  loginMutation: ReturnType<typeof useMutation<BaseResponse<LoginResult>, Error, LoginRequestDto>>;
  registerMutation: ReturnType<
    typeof useMutation<BaseResponse<RegisterResult>, Error, RegisterRequestDto>
  >;
  logoutMutation: ReturnType<typeof useMutation<BaseResponse, Error, void>>;
  updateProfileImage: (newProfileImage: string) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const INITIAL_STATE: AuthState = {
  isAuthenticated: false,
  username: '',
  accessToken: '',
  profileImage: '',
};

const getStoredState = () => {
  try {
    const storedState = localStorage.getItem(ENV.AUTH_STORAGE_KEY);
    if (!storedState) {
      return INITIAL_STATE;
    }

    return JSON.parse(storedState) as AuthState;
  } catch {
    return INITIAL_STATE;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>(getStoredState());
  const toast = useToast();

  useEffect(() => {
    localStorage.setItem(ENV.AUTH_STORAGE_KEY, JSON.stringify(authState));
  }, [authState]);

  const registerMutation = useMutation({
    mutationFn: (registerRequestDto: RegisterRequestDto) => {
      return authAPI.register(registerRequestDto);
    },
    onSuccess: () => {
      window.location.href = '/login';
    },
    onError: () => {
      toast.error('Failed to register. Please try again.');
    },
  });

  const loginMutation = useMutation({
    mutationFn: (loginRequestDto: LoginRequestDto) => {
      return authAPI.login(loginRequestDto);
    },
    onSuccess: (data) => {
      setAuthState({
        isAuthenticated: true,
        username: data.result.username,
        accessToken: data.result.accessToken,
        profileImage: data.result.profileImage,
      });
      queryClient.clear();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => {
      return authAPI.logout();
    },
    onSuccess: () => {
      setAuthState(INITIAL_STATE);
      queryClient.clear();
    },
  });

  const updateProfileImage = (newProfileImage: string) => {
    setAuthState((prevState) => ({
      ...prevState,
      profileImage: newProfileImage,
    }));
  };

  const value = useMemo(
    () => ({
      ...authState,
      loginMutation,
      registerMutation,
      logoutMutation,
      updateProfileImage,
    }),
    [authState, loginMutation, registerMutation, logoutMutation]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
