import { BaseModel } from './base';

export interface Meeting extends BaseModel {
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  organizerId: string;
  organizerName: string;
  status: MeetingStatus;
  audioRecording?: string;
  transcript?: string;
  summary?: string;
  attendees: string[];
}

export enum MeetingStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}