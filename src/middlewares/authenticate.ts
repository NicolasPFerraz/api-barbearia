import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.auth_token;

  console.log('Request cookies:', req.cookies);
  console.log('Auth token:', token);

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, 'secretKey'); 
    (req as any).user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

export default authenticate;