import { pool } from '../db';
import { Appointment } from '../types/appointment';

export async function fetchAllAppointments() {
  const result = await pool.query(`
    SELECT 
      a.*, 
      s.name as service_name,
      s.price as service_price,
      b.name as barber_name
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    LEFT JOIN barbers b ON a.barber_id = b.id
  `);
  return result.rows;
}