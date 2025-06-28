import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError, handleError } from '../utils/errorHandler';

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.auth_token;

  console.log('Request cookies:', req.cookies);
  console.log('Auth token:', token);

  if (!token) {
    return handleError(new ApiError(401, 'Não autorizado.'), res);
  }

  try {
    const decoded = jwt.verify(token, 'secretKey'); 
    (req as any).user = decoded;
    next();
  } catch (err: any) {
    console.error('Token verification failed:', err);
    handleError(new ApiError(401, 'Token inválido ou expirado.'), res);
  }
};

export default authenticate;