export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  vin: string;
  licensePlate: string;
  updatedAt: number;
  oilFilterPartNumber?: string;
  airFilterPartNumber?: string;
  cabinAirFilterPartNumber?: string;
  fuelFilterPartNumber?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  updatedAt: number;
}

export interface Inspector {
  id: string;
  name: string;
  phone: string;
  email: string;
  updatedAt: number;
}

export interface UserSettings {
  id: number; // Will always be 1 for the single settings object
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  logoImage?: string; // base64 encoded image
  userRole?: 'manager' | 'technician';
  onboardingComplete?: boolean;
  updatedAt: number;
}

export enum SyncStatus {
  OFFLINE = 'OFFLINE',
  CONNECTING = 'CONNECTING',
  LIVE = 'LIVE',
  ERROR = 'ERROR'
}

export type ChecklistStatus = 'pass' | 'fail' | 'na';

export type MediaType = 'image' | 'video' | 'audio';

export interface MediaAttachment {
  id: string;
  type: MediaType;
  data: string; // base64 encoded data
  mimeType: string;
}

export interface ChecklistItem {
  id: string;
  name: string;
  status: ChecklistStatus;
  notes?: string;
  media?: MediaAttachment[];
}

export interface ChecklistTemplateItem {
  id:string;
  name: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  items: ChecklistTemplateItem[];
  updatedAt: number;
}

export interface Inspection {
  id: string;
  vehicleId: string;
  checklistTemplateId: string;
  checklistTemplateName: string;
  inspectorId?: string;
  inspectorName: string;
  inspectionDate: number;
  checklist: ChecklistItem[];
  overallNotes?: string;
  customerId?: string;
  status?: 'draft' | 'sent';
  latitude?: number;
  longitude?: number;
  updatedAt: number;
}