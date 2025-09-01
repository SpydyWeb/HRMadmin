import { apiClient } from './apiClient';
import type { LoginRequest } from '@/models/authentication';
import type { LoginResponse } from '@/utils/models';



export const authService = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/Auth/Login', data),
};
