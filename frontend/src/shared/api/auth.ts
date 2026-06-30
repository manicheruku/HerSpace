import { api } from "@/shared/api/client";

/** A HerSpace user as returned by the auth endpoints. */
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

/** Response shape for `/auth/register` and `/auth/login`. */
export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/register", payload);
}

export function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/login", payload);
}

export function meApi(): Promise<User> {
  return api.get<User>("/auth/me");
}
