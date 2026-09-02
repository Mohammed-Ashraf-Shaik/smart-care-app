import { QueueItem, TriagePriority } from '@smartcare/types';
import { patientIntakeSchema } from '@smartcare/validators';

console.log('SmartCare API Gateway service loaded.');

export function calculateTriage(symptoms: string, age: number): TriagePriority {
  const lower = symptoms.toLowerCase();
  if (lower.includes('chest pain') || lower.includes('breathing') || lower.includes('unconscious') || age > 80) {
    return 'Red';
  }
  if (lower.includes('fever') || lower.includes('fracture') || lower.includes('bleeding')) {
    return 'Yellow';
  }
  return 'Green';
}
