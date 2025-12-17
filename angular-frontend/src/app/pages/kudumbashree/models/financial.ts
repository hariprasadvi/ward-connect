import { BaseModel } from './base';

export interface FinancialTransaction extends BaseModel {
  transactionId: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: TransactionCategory;
  date: Date;
  userId?: string;
  userName?: string;
  meetingId?: string;
  meetingTitle?: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  qrCode?: string;
  referenceNumber?: string;
}

export interface FinancialReport {
  period: DateRange;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactions: FinancialTransaction[];
  attendanceCollections: AttendanceCollection[];
  summary: FinancialSummary;
}

export interface AttendanceCollection {
  meetingId: string;
  meetingTitle: string;
  date: Date;
  expectedAmount: number;
  collectedAmount: number;
  pendingAmount: number;
  attendanceCount: number;
}

export interface FinancialSummary {
  totalMembers: number;
  activeMembers: number;
  totalLoansDisbursed: number;
  totalLoansRecovered: number;
  pendingLoans: number;
  meetingCollections: number;
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export enum TransactionCategory {
  ATTENDANCE_FEE = 'attendance_fee',
  LOAN_REPAYMENT = 'loan_repayment',
  MEMBERSHIP_FEE = 'membership_fee',
  PROJECT_CONTRIBUTION = 'project_contribution',
  UTILITIES = 'utilities',
  SALARIES = 'salaries',
  MAINTENANCE = 'maintenance',
  OTHER = 'other'
}

export enum PaymentMethod {
  CASH = 'cash',
  UPI = 'upi',
  BANK_TRANSFER = 'bank_transfer',
  CHEQUE = 'cheque',
  QR_CODE = 'qr_code'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}