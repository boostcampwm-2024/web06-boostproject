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
    const { data } = await axiosInstance.post<BaseResponse<LoginResult>>(
      '/auth/signin',
      loginRequestDto
    );

    return data;
  },

  logout: async () => {
    const { data } = await axiosInstance.post<BaseResponse>('/auth/signout');

    return data;
  },

  register: async (registerRequestDto: RegisterRequestDto) => {
    const { data } = await axiosInstance.post<BaseResponse<RegisterResult>>(
      '/auth/signup',
      registerRequestDto
    );

    return data;
  },
};
