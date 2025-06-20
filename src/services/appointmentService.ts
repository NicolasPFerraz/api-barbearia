import { pool } from '../db';
import { Appointment } from '../types/appointment';

export async function createAppointment(data: Appointment) {
  let { customer_name, customer_phone, service_id, start_time, appointment_date, barber_id } = data;

  const serviceResult = await pool.query(
    `SELECT duration FROM services WHERE id = $1`,
    [service_id]
  );

  if (serviceResult.rowCount === 0) {
    throw new Error('Serviço não encontrado');
  }

  const duration = serviceResult.rows[0].duration;

  if (barber_id === '') {
    barber_id = await findAvailableBarber(appointment_date, start_time, service_id);
    if (!barber_id) {
      throw new Error('Nenhum barbeiro disponível');
    }
  }

  const result = await pool.query(
    `INSERT INTO appointments (customer_name, customer_phone, service_id, start_time, appointment_date, duration, barber_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [customer_name, customer_phone, service_id, start_time, appointment_date, duration, barber_id]
  );
  return result.rows[0];
}

export async function getAvailableSlots(appointment_date: string, barber_id: string, service_id: string) {
  // Buscar duração do serviço
  const serviceResult = await pool.query(
    `SELECT duration FROM services WHERE id = $1`,
    [service_id]
  );
  if (serviceResult.rowCount === 0) {
    throw new Error('Serviço não encontrado');
  }
  const serviceDuration = serviceResult.rows[0].duration;

  // Buscar todos os barbeiros se barber_id não for informado
  let barbers: { id: string }[] = [];
  if (!barber_id) {
    const barbersResult = await pool.query(`SELECT id FROM barbers`);
    barbers = barbersResult.rows;
  } else {
    barbers = [{ id: barber_id }];
  }

  const allSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30'
  ];

  function toMinutes(time: string) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  async function isSlotAvailable(slot: string) {
    for (const barber of barbers) {
      const appointmentsResult = await pool.query(
        `SELECT start_time, duration FROM appointments WHERE appointment_date = $1 AND barber_id = $2`,
        [appointment_date, barber.id]
      );
      const appointments = appointmentsResult.rows;
      const slotStart = toMinutes(slot);
      const slotEnd = slotStart + serviceDuration;
      let conflict = false;
      for (const appt of appointments) {
        const apptStart = toMinutes(appt.start_time);
        const apptEnd = apptStart + appt.duration;
        if (Math.max(slotStart, apptStart) < Math.min(slotEnd, apptEnd)) {
          conflict = true;
          break;
        }
      }
      if (!conflict) return true; // pelo menos um barbeiro livre
    }
    return false;
  }

  // Montar os slots com status
  const slotsWithStatus = [];
  for (const slot of allSlots) {
    const available = await isSlotAvailable(slot);
    slotsWithStatus.push({
      time: slot,
      status: available ? 'disponível' : 'ocupado'
    });
  }

  return slotsWithStatus;
}

export async function findAvailableBarber(appointment_date: string, start_time: string, service_id: string) {
  // Buscar duração do serviço
  const serviceResult = await pool.query(
    `SELECT duration FROM services WHERE id = $1`,
    [service_id]
  );
  if (serviceResult.rowCount === 0) {
    throw new Error('Serviço não encontrado');
  }
  const duration = serviceResult.rows[0].duration;

  // Buscar todos os barbeiros
  const barbersResult = await pool.query(`SELECT id FROM barbers`);
  const barbers = barbersResult.rows;

  // Para cada barbeiro, verificar se está livre no horário
  for (const barber of barbers) {
    const appointmentsResult = await pool.query(
      `SELECT 1 FROM appointments
       WHERE barber_id = $1
         AND appointment_date = $2
         AND (
           (start_time, start_time::time + (duration || ' minutes')::interval)
           OVERLAPS
           ($3::time, ($3::time + ($4 || ' minutes')::interval))
         )`,
      [barber.id, appointment_date, start_time, duration]
    );
    if (appointmentsResult.rowCount === 0) {
      // Este barbeiro está disponível
      return barber.id;
    }
  }

  // Nenhum barbeiro disponível
  return null;
}