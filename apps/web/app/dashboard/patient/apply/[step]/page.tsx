import type { Metadata } from 'next';
import { BookingWizard } from '@/features/patient/booking/BookingWizard';

export const metadata: Metadata = { title: 'Book Appointment' };

export default function BookingStep({ params }: { params: { step: string } }) {
  return <BookingWizard step={parseInt(params.step) || 1} />;
}
