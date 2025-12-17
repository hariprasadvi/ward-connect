import { BaseModel } from './base';
import { Meeting } from './meeting';
import { User } from './user';

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalMeetings: number;
  upcomingMeetings: number;
  totalLoans: number;
  pendingLoans: number;
  totalLoanAmount: number;
  recoveredAmount: number;
  pendingAmount: number;
  attendanceRate: number;
}

export interface MemberDashboard {
  user: User;
  stats: {
    meetingsAttended: number;
    totalMeetings: number;
    attendanceRate: number;
    loansTaken: number;
    activeLoans: number;
    totalLoanAmount: number;
    repaidAmount: number;
    pendingAmount: number;
    nextMeeting?: Meeting;
    recentActivities: Activity[];
  };
}

export interface Activity {
  id: string;
  type: 'meeting' | 'loan' | 'attendance' | 'payment';
  title: string;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'upcoming';
}

export interface FinancialSummary {
  totalFunds: number;
  availableBalance: number;
  totalLoansDisbursed: number;
  totalRepayments: number;
  pendingCollections: number;
  monthlyCollections: MonthlyCollection[];
}

export interface MonthlyCollection {
  month: string;
  year: number;
  totalCollection: number;
  target: number;
  achieved: number;
}