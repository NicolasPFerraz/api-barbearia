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
    const { date, service, barber } = req.query;
    const slots = await appointmentService.getAvailableSlots(
      String(date),
      String(service),
      String(barber)
    );
    res.json(slots);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};