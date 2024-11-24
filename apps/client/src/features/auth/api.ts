import { axiosInstance } from '@/lib/axios.ts';
import { BaseResponse } from '@/features/types.ts';
import {
  LoginRequestDto,
  LoginResult,
  RegisterRequestDto,
  RegisterResult,
} from '@/features/auth/types.ts';

export const authAPI = {
  login: async (loginRequestDto: LoginRequestDto) => {
    const response = await axiosInstance.post<BaseResponse<LoginResult>>(
      '/auth/signin',
      loginRequestDto
    );

    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post<BaseResponse>('/auth/signout');

    return response.data;
  },

  register: async (registerRequestDto: RegisterRequestDto) => {
    const response = await axiosInstance.post<BaseResponse<RegisterResult>>(
      '/auth/signup',
      registerRequestDto
    );

    return response.data;
  },
};
