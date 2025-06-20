import { Request, Response } from 'express';
import * as adminService from '../services/adminService';

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const data = await adminService.fetchAllAppointments();
    console.log(data)
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