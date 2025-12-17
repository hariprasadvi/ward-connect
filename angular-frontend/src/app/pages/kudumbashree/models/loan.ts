import { BaseModel } from './base';

export interface Loan extends BaseModel {
  loanNumber: string;
  userId: string;
  userName: string;
  amount: number;
  purpose: string;
  description?: string;
  status: LoanStatus;
  appliedDate: Date;
  approvedDate?: Date;
  interestRate: number;
  tenureMonths: number;
}

export enum LoanStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISBURSED = 'disbursed'
}