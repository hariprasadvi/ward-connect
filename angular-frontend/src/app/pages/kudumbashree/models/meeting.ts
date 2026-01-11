import { BaseModel } from './base';

export interface KudumbashreeMeeting extends BaseModel {
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
  SCHEDULED = 'Scheduled',
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}
