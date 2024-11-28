import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

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

export interface AuthContextValue extends AuthState {
  loginMutation: ReturnType<
    typeof useMutation<BaseResponse<LoginResult>, AxiosError, LoginRequestDto>
  >;
  registerMutation: ReturnType<
    typeof useMutation<BaseResponse<RegisterResult>, AxiosError, RegisterRequestDto>
  >;
  logoutMutation: ReturnType<typeof useMutation<BaseResponse, AxiosError, void>>;
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

  useEffect(() => {
    localStorage.setItem(ENV.AUTH_STORAGE_KEY, JSON.stringify(authState));
  }, [authState]);

  const registerMutation = useMutation<
    BaseResponse<RegisterResult>,
    AxiosError,
    RegisterRequestDto
  >({
    mutationFn: (registerRequestDto: RegisterRequestDto) => {
      return authAPI.register(registerRequestDto);
    },
  });

  const loginMutation = useMutation<BaseResponse<LoginResult>, AxiosError, LoginRequestDto>({
    mutationFn: (loginRequestDto) => {
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

  const logoutMutation = useMutation<BaseResponse, AxiosError, void>({
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
