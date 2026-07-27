export type Role = 'superadmin' | 'admin' | 'editor';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginResponse = {
  user: AdminUser;
  accessToken: string; // JWT
  refreshToken?: string;
};
