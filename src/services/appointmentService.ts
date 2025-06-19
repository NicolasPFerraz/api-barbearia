import { pool } from '../db';
import { Appointment } from '../types/appointment';

export async function createAppointment(data: Appointment) {
  const { fullName, phone, service, barber, date, time } = data;
  const result = await pool.query(
    `INSERT INTO appointments (full_name, phone, service, barber, date, time)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [fullName, phone, service, barber, date, time]
  );
  return result.rows[0];
}

export async function getAvailableSlots(date: string, service: string, barber: string) {
  // Exemplo: retorna horários das 09:00 às 19:00 que não estão ocupados
  const allSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30'
  ];
  const result = await pool.query(
    `SELECT time FROM appointments WHERE date = $1 AND barber = $2`,
    [date, barber]
  );
  const booked = result.rows.map((row: any) => row.time);
  return allSlots.filter(slot => !booked.includes(slot));
}