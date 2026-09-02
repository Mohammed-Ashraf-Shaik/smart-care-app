import { z } from 'zod';

export const triagePrioritySchema = z.enum(['Green', 'Yellow', 'Red']);
export const queueStatusSchema = z.enum(['waiting', 'called', 'in_progress', 'completed', 'cancelled', 'no-show']);
export const userRoleSchema = z.enum(['patient', 'doctor', 'staff']);

export const patientIntakeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  age: z.number().int().min(0).max(120),
  gender: z.string().optional(),
  doctorPref: z.string().optional(),
  area: z.string().optional(),
  symptoms: z.string().min(1, 'Symptoms are required').max(500),
  problem: z.string().optional(),
  hospital: z.string().min(1, 'Hospital selection is required'),
  country: z.string().default('India'),
  state: z.string().optional(),
  city: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: userRoleSchema,
});

export const donationInterestSchema = z.object({
  type: z.enum(['blood', 'organ']),
  name: z.string().min(2).max(120),
  city: z.string().min(2).max(120),
  preference: z.string().optional(),
});

export const medicationSchema = z.object({
  medicineName: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  conditionTreated: z.string().min(1, 'Condition treated is required'),
  notes: z.string().optional(),
});

export const allergyAvoidSchema = z.object({
  substance: z.string().min(1, 'Substance/Medication name is required'),
  severity: z.enum(['Mild', 'Moderate', 'Severe', 'Life-Threatening']),
  reactionDescription: z.string().min(1, 'Reaction description is required'),
});

export type PatientIntakeInput = z.infer<typeof patientIntakeSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type DonationInterestInput = z.infer<typeof donationInterestSchema>;
export type MedicationInput = z.infer<typeof medicationSchema>;
export type AllergyAvoidInput = z.infer<typeof allergyAvoidSchema>;
