import { Request, Response } from 'express';
import * as adminService from '../services/adminService';

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const data = await adminService.fetchAllAppointments();
    console.log(data)
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};