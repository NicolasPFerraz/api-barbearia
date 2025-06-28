import { pool } from '../db';
import { ApiError } from '../utils/errorHandler';
import { Appointment } from '../types/appointment';

async function incrementClientAppointments(client_id: number): Promise<void> {
  try {
    await pool.query(
      `UPDATE clients SET total_appointments = total_appointments + 1 WHERE id = $1`,
      [client_id]
    );
  } catch (error) {
    console.error('Error incrementing client appointments:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Erro ao incrementar agendamentos do cliente.');
  }
}

async function checkClientExists(client_phone: string): Promise<boolean> {
  try {
    const result = await pool.query(
      `SELECT id FROM clients WHERE phone_number = $1`,
      [client_phone]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error checking client existence:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Erro ao verificar existência do cliente.');
  }
}

async function createClient(client_name: string, client_phone: string): Promise<number> {
  try {
    const result = await pool.query(
      `INSERT INTO clients (name, phone_number, total_appointments) VALUES ($1, $2, $3) RETURNING id`,
      [client_name, client_phone, 1]
    );
    return result.rows[0].id;
  } catch (error) {
    console.error('Error creating client:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Erro ao criar cliente.');
  }
}

// Função para criar um novo agendamento
export async function createAppointment(data: Appointment) {
  try {
    // Desestrutura os dados do agendamento
    let { client_name, client_phone, service_id, start_time, appointment_date, barber_id } = data;
    let client_id: number;

    // Verifica se o cliente já está cadastrado
    const clientExists = await checkClientExists(client_phone);
    if (!clientExists) {
      client_id = await createClient(client_name, client_phone);
      console.log(`Novo cliente ${client_name} criado com sucesso.`);
    } else {
      const clientResult = await pool.query(
        `SELECT id FROM clients WHERE phone_number = $1`,
        [client_phone]
      );
      client_id = clientResult.rows[0].id;
    }

    // Busca a duração do serviço no banco de dados
    const serviceResult = await pool.query(
      `SELECT duration FROM services WHERE id = $1`,
      [service_id]
    );

    incrementClientAppointments(client_id); 

    // Se não encontrar o serviço, lança erro
    if (serviceResult.rowCount === 0) {
      throw new ApiError(404, 'Serviço não encontrado.');
    }

    // Pega a duração do serviço
    const duration = serviceResult.rows[0].duration;

    // Se não foi informado um barbeiro, busca um disponível
    if (barber_id === '') {
      barber_id = await findAvailableBarber(appointment_date, start_time, service_id);
      if (!barber_id) {
        throw new ApiError(400, 'Nenhum barbeiro disponível para o horário e serviço selecionados.');
      }
    }

    // Insere o agendamento no banco de dados
    const result = await pool.query(
      `INSERT INTO appointments (client_id, service_id, barber_id, appointment_date, start_time, duration)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [client_id, service_id, barber_id, appointment_date, start_time, duration]
    );

    return result.rows[0];
  } catch (error) {
    // Loga e repassa o erro
    console.error('Error creating appointment:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Erro ao criar agendamento.');
  }
}

// Função para buscar os horários disponíveis para agendamento
export async function getAvailableSlots(appointment_date: string, barber_id: string, service_id: string) {
  try {
    // Busca a duração do serviço
    const serviceResult = await pool.query(
      `SELECT duration FROM services WHERE id = $1`,
      [service_id]
    );
    if (serviceResult.rowCount === 0) {
      throw new ApiError(404, 'Serviço não encontrado.');
    }
    const serviceDuration = serviceResult.rows[0].duration;

    // Busca todos os barbeiros se barber_id não for informado
    let barbers: { id: string }[] = []; // array de objetos com id do barbeiro
    if (!barber_id) {
      const barbersResult = await pool.query(`SELECT id FROM barbers`);
      barbers = barbersResult.rows;
    } else {
      barbers = [{ id: barber_id }];
    }

    // Lista de todos os horários possíveis para agendamento
    const allSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
      '18:00', '18:30', '19:00', '19:30'
    ];

    // Função auxiliar para converter horário string em minutos
    function toMinutes(time: string) {
      const [h, m] = time.split(':').map(Number); // Exemplo: '09:30' -> [9, 30]
      return h * 60 + m; // Converte para minutos totais
    }

    // Função para verificar se um slot está disponível para pelo menos um barbeiro
    async function isSlotAvailable(slot: string) {
      for (const barber of barbers) {
        // Busca todos os agendamentos do barbeiro na data
        const appointmentsResult = await pool.query(
          `SELECT start_time, duration FROM appointments WHERE appointment_date = $1 AND barber_id = $2`,
          [appointment_date, barber.id]
        );
        const appointments = appointmentsResult.rows;
        const slotStart = toMinutes(slot); // início do slot em minutos
        const slotEnd = slotStart + serviceDuration; // fim do slot em minutos
        let conflict = false;
        // Verifica se há conflito com algum agendamento existente
        for (const appt of appointments) {
          const apptStart = toMinutes(appt.start_time); // início do agendamento existente
          const apptEnd = apptStart + appt.duration; // fim do agendamento existente
          // Se houver sobreposição de horários, marca conflito
          // Exemplo prático:
          // slotStart = 600 (10:00), slotEnd = 630 (10:30)
          // apptStart = 615 (10:15), apptEnd = 645 (10:45)
          // Math.max(600, 615) = 615
          // Math.min(630, 645) = 630
          // 615 < 630 => conflito, pois os horários se sobrepõem
          if (Math.max(slotStart, apptStart) < Math.min(slotEnd, apptEnd)) {
            conflict = true;
            break;
          }
        }
        // Se não houver conflito para esse barbeiro, retorna true (slot disponível)
        if (!conflict) return true;
      }
      // Se todos os barbeiros tiverem conflito, retorna false (slot ocupado)
      return false;
    }

    // Monta a lista de slots com status de disponibilidade
    const slotsWithStatus = [];
    for (const slot of allSlots) {
      const available = await isSlotAvailable(slot);
      slotsWithStatus.push({
        time: slot,
        status: available ? 'disponível' : 'ocupado'
      });
    }

    // Retorna a lista de horários com status
    return slotsWithStatus;
  } catch (error) {
    // Loga e repassa o erro
    console.error('Error fetching available slots:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Erro ao buscar horários disponíveis.');
  }
}

// Função para encontrar um barbeiro disponível para um horário e serviço
export async function findAvailableBarber(appointment_date: string, start_time: string, service_id: string) {
  // Busca a duração do serviço
  const serviceResult = await pool.query(
    `SELECT duration FROM services WHERE id = $1`,
    [service_id]
  );
  if (serviceResult.rowCount === 0) {
    throw new ApiError(404, 'Serviço não encontrado.');
  }
  const duration = serviceResult.rows[0].duration;

  // Busca todos os barbeiros
  const barbersResult = await pool.query(`SELECT id FROM barbers`);
  const barbers = barbersResult.rows;

  // Para cada barbeiro, verifica se está livre no horário desejado
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
    // Se não houver agendamento conflitante, retorna o id do barbeiro disponível
    if (appointmentsResult.rowCount === 0) {
      return barber.id;
    }
  }

  // Se nenhum barbeiro estiver disponível, retorna null
  return null;
}