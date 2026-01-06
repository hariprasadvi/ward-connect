export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  photoUrl?: string;
  status: ComplaintStatus;
  assignedStaff?: string;
  adminResponse?: string;
  houseNumber?: string;
  User?: {
    house_number?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export enum ComplaintCategory {
  MISSED_PICKUP = 'missed-pickup',
  IMPROPER_COLLECTION = 'improper-collection',
  LITTERING = 'littering',
  ILLEGAL_DUMPING = 'illegal-dumping',
  OTHER = 'other'
}

export enum ComplaintStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in-progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface ComplaintData {
  title: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  photo?: File;
  photoUrl?: string;
}




