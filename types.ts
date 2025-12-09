export enum ServiceType {
  MANICURE = 'Manicure',
  PEDICURE = 'Pedicure',
  COMBO = 'Manicure + Pedicure',
  REMOVAL = 'Removal'
}

export interface Master {
  id: string;
  name: string;
  email: string;
  color: string;
  borderColor: string;
  avatar: string;
}

export interface Appointment {
  id: string;
  masterId: string;
  clientName: string;
  clientPhone: string;
  serviceType: ServiceType;
  startTime: string; // ISO String
  endTime: string; // ISO String
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export type ViewMode = 'calendar' | 'dashboard';
export type CalendarViewType = 'day' | 'week'; // Simplified for mobile focus
