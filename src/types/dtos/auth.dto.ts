/**
 * Authentication DTOs
 */

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface JwtPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}