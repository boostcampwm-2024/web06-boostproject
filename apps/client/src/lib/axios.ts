import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@/config/env';

const { API_BASE_URL, AUTH_STORAGE_KEY } = ENV;

export interface AuthStorage {
  isAuthenticated: boolean;
  username: string;
  accessToken: string;
}

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    try {
      const authStorageString = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!authStorageString) {
        return config;
      }

      const authContext = JSON.parse(authStorageString) as AuthStorage;
      const { accessToken } = authContext;

      const newConfig = { ...config };
      newConfig.headers.Authorization = `Bearer ${accessToken}`;

      return newConfig;
    } catch {
      return config;
    }
  }
);

const REFRESH_MAX_RETRY_COUNT = 3;

/* eslint no-underscore-dangle: 0 */
axiosInstance.interceptors.response.use(
  (response) => Promise.resolve(response),
  async (error) => {
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const originalReq = error.config;

    if (originalReq._retry >= REFRESH_MAX_RETRY_COUNT) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return Promise.reject(error);
    }

    originalReq._retry = (originalReq._retry || 0) + 1;

    try {
      const response = await axiosInstance.post('/auth/refresh');
      if (response.status !== 200) {
        throw new Error('Refresh token failed');
      }

      const { username, accessToken } = response.data.result;
      const authStorage: AuthStorage = { accessToken, isAuthenticated: true, username };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authStorage));

      const newConfig = { ...originalReq };
      newConfig.headers.Authorization = `Bearer ${accessToken}`;

      return axiosInstance(newConfig);
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return Promise.reject(error);
    }
  }
);
