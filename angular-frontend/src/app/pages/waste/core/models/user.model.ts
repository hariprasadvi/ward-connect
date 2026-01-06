export interface User {
  id: string;
  email: string;
  name: string;
  full_name?: string;
  role: UserRole;
  phone?: string;
  address?: string;
  houseNumber?: string;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
}




