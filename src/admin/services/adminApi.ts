import { http } from './api';
import type { AdminUser, LoginResponse, Role } from '../types/models';

export async function loginAdmin(email: string, password: string): Promise<LoginResponse> {
  return http<LoginResponse>('/admin/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function getMe(): Promise<AdminUser> {
  return http<AdminUser>('/admin/auth/me', { method: 'GET', auth: true });
}

export type CreateAdminUserInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

export async function createAdminUser(input: CreateAdminUserInput): Promise<AdminUser> {
  return http<AdminUser>('/admin/users', {
    method: 'POST',
    body: input,
    auth: true,
  });
}
