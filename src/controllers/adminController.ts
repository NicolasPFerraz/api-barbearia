import { Request, Response } from 'express';
import * as adminService from '../services/adminService';

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const data = await adminService.fetchAllAppointments();
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await adminService.deleteAppointment(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await adminService.updateAppointmentStatus(id, status);
    res.status(200).send();
  } catch (error) {
    res.status(400).json({ error });
  }
};