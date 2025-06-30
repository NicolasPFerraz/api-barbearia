import { Request, Response } from 'express';
import * as adminService from '../services/adminService';
import * as authService from '../services/authService';
import { ApiError, handleError } from '../utils/errorHandler';

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const data = await adminService.fetchAllAppointments();
    res.status(200).json(data);
  } catch (error: any) {
    handleError(error, res);
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await adminService.deleteAppointment(id);
    res.status(204).send();
  } catch (error: any) {
    handleError(error, res);
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await adminService.updateAppointmentStatus(id, status);
    res.status(200).send();
  } catch (error: any) {
    handleError(error, res);
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const token = await authService.authenticate(username, password);

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: 'Login realizado com sucesso', token });
  } catch (error: any) {
    handleError(error, res);
  }
}

export const logoutAdmin = async (req: Request, res: Response) => {
  try {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });

    res.status(200).json({ message: 'Logout realizado com sucesso' });
  } catch (error: any) {
    handleError(error, res);
  }
}

export const checkAdmin = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.auth_token;

    if (!token) {
      throw new ApiError(401, 'Não autorizado.');
    }

    const isValid = await authService.verifyToken(token);

    if (!isValid) {
      throw new ApiError(401, 'Token inválido ou expirado.');
    }
    res.status(200).json({ authenticated: true });
  } catch (error: any) {
    handleError(error, res);
  }
}