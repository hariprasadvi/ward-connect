import { BaseModel } from './base';

export interface Attendance extends BaseModel {
  meetingId: string;
  meetingTitle: string;
  userId: string;
  userName: string;
  checkInTime: Date;
  checkOutTime?: Date;
  location: GeoLocation;
  faceVerified: boolean;
  verificationScore: number;
  deviceInfo: DeviceInfo;
  imageCapture?: string;
  attendanceFee: number;
  feePaid: boolean;
  paymentQrCode?: string;
  paymentTransactionId?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface DeviceInfo {
  deviceId: string;
  platform: string;
  browser: string;
  userAgent: string;
}

export interface AttendanceSummary {
  meetingId: string;
  meetingTitle: string;
  date: Date;
  totalMembers: number;
  present: number;
  absent: number;
  late: number;
  attendanceRate: number;
  totalCollection: number;
  collectedAmount: number;
  pendingAmount: number;
}

export interface UserAttendanceStats {
  userId: string;
  userName: string;
  totalMeetings: number;
  attended: number;
  attendanceRate: number;
  lateCount: number;
  totalFeesPaid: number;
  lastAttendance?: Date;
}