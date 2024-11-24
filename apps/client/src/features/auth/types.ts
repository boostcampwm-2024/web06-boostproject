export interface AuthState {
  isAuthenticated: boolean;
  username: string;
  accessToken: string;
}

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface LoginResult {
  id: number;
  username: string;
  accessToken: string;
}

export interface RegisterRequestDto {
  username: string;
  password: string;
}

export interface RegisterResult {
  id: number;
  username: string;
}
