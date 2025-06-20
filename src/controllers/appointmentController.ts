import { Request, Response } from 'express';
import * as appointmentService from '../services/appointmentService';

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await appointmentService.createAppointment(req.body);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { appointment_date, service_id, barber_id } = req.body;
    const slots = await appointmentService.getAvailableSlots(
      appointment_date,
      barber_id,
      service_id
    );
    res.json(slots);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};