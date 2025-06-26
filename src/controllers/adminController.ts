import { Request, Response } from 'express';
import * as adminService from '../services/adminService';
import * as authService from '../services/authService';
import { CookieOptions } from 'express';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.SECURE_COOKIE === 'true', 
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
};

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

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const token = await authService.authenticate(username, password);

    res.cookie('auth_token', token, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      maxAge: cookieOptions.maxAge,
    });

    res.status(200).json({ message: 'Login realizado com sucesso', token });
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
}