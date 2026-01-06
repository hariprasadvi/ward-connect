export interface PickupRequest {
  id: string;
  userId: string;
  userName: string;
  type: PickupType;
  scheduledDate: Date;
  scheduledTime: string;
  address: string;
  status: PickupStatus;
  wasteType?: string;
  quantity?: string;
  description?: string;
  assignedVehicle?: string;
  houseNumbers?: string[];
  isAdminScheduled?: boolean;
  isUserAcknowledged?: boolean;
  createdAt: Date;
}

export enum PickupType {
  REGULAR = 'regular',
  BULK = 'bulk'
}

export enum PickupStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface SchedulePickupData {
  scheduledDate: Date;
  scheduledTime: string;
  address: string;
  houseNumbers?: string[];
}

export interface BulkPickupData {
  scheduledDate: Date;
  scheduledTime: string;
  address: string;
  wasteType: string;
  quantity: string;
  description: string;
}

export interface AdminSchedulePickupData {
  houseNumbers: string[];
  scheduledDate: Date;
  scheduledTime: string;
  address?: string;
  wasteType: string;
}




