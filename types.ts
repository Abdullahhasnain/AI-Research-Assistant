export type ChatRole = 'user' | 'model';

export type UserRole = 'Doctor' | 'Nurse' | 'Admin' | 'Staff';

export interface User {
  username: string;
  name: string;
  role: UserRole;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  image?: string; // base64 data string
  timestamp: number;
}

export interface MedicalRecord {
  patient_id: string;
  name: string;
  age: string | number;
  gender: string;
  chief_complaint: string;
  duration: string;
  pain_severity_1to10: string | number;
  pre_existing_conditions: string[];
  reports_attached: boolean;
  risk_category: string; // "Low", "Moderate", "High"
  suggested_action: string;
  timestamp: string;
}

export enum RiskLevel {
  LOW = 'Low',
  MODERATE = 'Moderate',
  HIGH = 'High',
  UNKNOWN = 'Unknown'
}

export interface ProcessingState {
  isTyping: boolean;
  error: string | null;
}
