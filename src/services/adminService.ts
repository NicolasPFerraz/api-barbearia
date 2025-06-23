import { pool } from '../db';
import { Appointment } from '../types/appointment';

export async function fetchAllAppointments() {
  try {
    const result = await pool.query(`
      SELECT 
        a.*, 
        s.name as service_name,
        s.price as service_price,
        b.name as barber_name
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      LEFT JOIN barbers b ON a.barber_id = b.id
      ORDER BY a.appointment_date ASC, a.start_time ASC
    `);
    return result.rows;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
}

export async function deleteAppointment(id: string) {
  try {
    await pool.query('DELETE FROM appointments WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
}

export async function updateAppointmentStatus(id: string, status: string): Promise<boolean> {
  try {
    const result = await pool.query('UPDATE appointments SET status = $1 WHERE id = $2', [status, id]);
    return (result.rowCount ?? 0) > 0; 
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
}