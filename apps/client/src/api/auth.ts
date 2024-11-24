import { axiosInstance } from '@/lib/axios.ts';

interface BaseResponse<T = void> {
  status: number;
  message: string;
  result: T extends void ? never : T;
}

interface LoginRequestDto {
  username: string;
  password: string;
}

interface LoginResult {
  id: number;
  username: string;
  accessToken: string;
}

interface RegisterRequestDto {
  username: string;
  password: string;
}

interface RegisterResult {
  id: number;
  username: string;
}

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
