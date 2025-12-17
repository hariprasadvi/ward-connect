import { BaseModel } from './base';

export interface User extends BaseModel {
  memberId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
  profileImage?: string;
  isActive: boolean;
  joinDate: Date;
  groupId?: string;
  groupName?: string;
  totalLoans: number;
  activeLoans: number;
  totalMeetings: number;
  attendanceRate: number;
}

export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  COORDINATOR = 'coordinator'
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  attendanceRate: number;
}

export interface FinancialStats {
  totalLoanAmount: number;
  totalRepaid: number;
  pendingAmount: number;
  monthlyCollection: number;
  defaultedLoans: number;
}