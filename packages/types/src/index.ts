export type TriagePriority = 'Green' | 'Yellow' | 'Red';

export type QueueStatus = 'waiting' | 'called' | 'in_progress' | 'completed' | 'cancelled' | 'no-show';

export type UserRole = 'patient' | 'doctor' | 'staff';

export interface QueueItem {
  id: string;
  name: string;
  age: number;
  gender?: string;
  doctorPref?: string;
  area?: string;
  symptoms: string;
  problem?: string;
  hospital: string;
  country: string;
  state?: string;
  city?: string;
  triage: TriagePriority;
  fee: number;
  status: QueueStatus;
  patientAuthId?: string;
  assignedProfessionalId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalProfile {
  id: string;
  email: string;
  hospital: string;
  role: UserRole;
  country: string;
  state?: string;
  city?: string;
  createdAt: string;
}

export interface PatientVisit {
  id: string;
  hospital: string;
  city: string;
  reason: string;
  date: string;
  status: string;
  reference: string;
}

export interface BloodDonationCentre {
  id: string;
  name: string;
  area: string;
  city: string;
  hours?: string;
  note?: string;
  supportedGroups: string[];
  isActive: boolean;
}

export interface DonationPost {
  id: string;
  type: 'blood' | 'organ';
  mode: 'offer' | 'request' | 'give' | 'receive';
  group?: string;
  units?: number;
  hospital?: string;
  name?: string;
  city: string;
  urgency?: 'Routine' | 'Urgent' | 'Planned';
  status?: string;
  date: string;
}

export interface MedicationItem {
  id: string;
  medicineName: string;
  dosage: string;
  conditionTreated: string;
  notes?: string;
}

export interface AllergyAvoidItem {
  id: string;
  substance: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Life-Threatening';
  reactionDescription: string;
}

export interface CareConditionItem {
  id: string;
  category: 'Dietary' | 'Positioning' | 'Environment' | 'Psychological';
  instruction: string;
}

export interface EmergencyProtocolItem {
  id: string;
  triggerCondition: string;
  actionSteps: string;
}

export interface DiseaseConditionItem {
  id: string;
  diseaseName: string;
  diagnosedSince: string;
  status: 'Active' | 'Managed' | 'In Remission';
}

export interface PersonalPreferenceItem {
  id: string;
  category: string;
  preference: string;
}

export interface PreviousProviderInfo {
  doctorName: string;
  hospitalName: string;
  city: string;
  contactPhone: string;
}

export interface PatientMedicalHistory {
  id: string;
  patientAuthId: string;
  lastUpdated: string;
  previousProvider: PreviousProviderInfo;
  diseases: DiseaseConditionItem[];
  personalPreferences: PersonalPreferenceItem[];
  effectiveMedications: MedicationItem[];
  allergiesAndAvoid: AllergyAvoidItem[];
  careConditions: CareConditionItem[];
  emergencyProtocols: EmergencyProtocolItem[];
  updatedAt: string;
}
