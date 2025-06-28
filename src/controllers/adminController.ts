import { Request, Response } from 'express';
import * as adminService from '../services/adminService';
import * as authService from '../services/authService';
import { CookieOptions } from 'express';

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const data = await adminService.fetchAllAppointments();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    res.status(400).json({ error });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await adminService.deleteAppointment(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting appointment:', error);
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
    console.error('Error updating appointment status:', error);
    res.status(400).json({ error });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const token = await authService.authenticate(username, password);

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: false, // em localhost
      sameSite: 'lax', // ou 'strict'
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: 'Login realizado com sucesso', token });
  } catch (error) {
    console.error('Error doing login:', error);
    res.status(401).json({ error });
  }
}