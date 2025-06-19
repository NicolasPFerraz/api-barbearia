export interface Appointment {
  id?: number;
  fullName: string;
  phone: string;
  service: string;
  barber: string;
  date: string; // formato: YYYY-MM-DD
  time: string; // formato: HH:mm
}