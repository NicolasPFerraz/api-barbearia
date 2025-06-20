import { pool } from '../db';
import { Appointment } from '../types/appointment';
import { DateTime } from 'luxon';

export async function createAppointment(data: Appointment) {
  console.log('Dados recebidos:', data);
  const { customer_name, customer_phone, service_id, start_time, appointment_date } = data;

  // Logs para depuração
  console.log('appointment_date:', appointment_date);
  console.log('start_time:', start_time);

  const serviceResult = await pool.query(
    `SELECT duration FROM services WHERE id = $1`,
    [service_id]
  );

  if (serviceResult.rowCount === 0) {
    throw new Error('Serviço não encontrado');
  }

  const duration = serviceResult.rows[0].duration;

  const result = await pool.query(
    `INSERT INTO appointments (customer_name, customer_phone, service_id, start_time, appointment_date, duration)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [customer_name, customer_phone, service_id, start_time, appointment_date, duration]
  );
  return result.rows[0];
}

export async function getAvailableSlots(date: string, service_id: string) {
  // 1. Buscar duração do serviço solicitado
  const serviceResult = await pool.query(
    `SELECT duration FROM services WHERE id = $1`,
    [service_id]
  );
  if (serviceResult.rowCount === 0) {
    throw new Error('Serviço não encontrado');
  }
  const serviceDuration = serviceResult.rows[0].duration; // em minutos

  // 2. Buscar todos os agendamentos do barbeiro para o dia
  const appointmentsResult = await pool.query(
    `SELECT start_time, duration FROM appointments WHERE appointment_date = $1 AND barber = $2`,
    [date]
  );
  const appointments = appointmentsResult.rows;

  // 3. Gerar todos os slots possíveis do dia
  const allSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30'
  ];

  // Função para converter "HH:mm" para minutos
  function toMinutes(time: string) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  // Função para verificar se há conflito de horários
  function isSlotAvailable(slot: string) {
    const slotStart = toMinutes(slot);
    const slotEnd = slotStart + serviceDuration;

    for (const appt of appointments) {
      const apptStart = toMinutes(appt.start_time);
      const apptEnd = apptStart + appt.duration;
      // Se houver sobreposição, o slot não está disponível
      if (Math.max(slotStart, apptStart) < Math.min(slotEnd, apptEnd)) {
        return false;
      }
    }
    return true;
  }

  // 4. Filtrar slots disponíveis
  const availableSlots = allSlots.filter(isSlotAvailable);

  return availableSlots;
}