import { Request, Response } from 'express';
import * as appointmentService from '../services/appointmentService';
import { ApiError, handleError } from '../utils/errorHandler';

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await appointmentService.createAppointment(req.body);
    res.status(201).json(appointment);
  } catch (error: any) {
    handleError(error, res);
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
  } catch (error: any) {
    handleError(error, res);
  }
};