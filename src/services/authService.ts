import { pool } from '../db';
import { ApiError } from '../utils/errorHandler';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const tokenOptions = {
  secretKey: 'secretKey',
  expiresIn: process.env.JWT_EXPIRATION || '1h',
};

export const generateJwtToken = async (id: string): Promise<string> => {
  const token = await jwt.sign({ id }, tokenOptions.secretKey, { expiresIn: tokenOptions.expiresIn });
  return token;
}

export const authenticate = async (username: string, password: string): Promise<string> => {
  const admin = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
  if (admin.rows.length === 0) {
    throw new ApiError(401, 'Credenciais inválidas.');
  } 

  const isValidPassword = await bcrypt.compare(password, admin.rows[0].password_hash);
  if (!isValidPassword) {
    throw new ApiError(401, 'Credenciais inválidas.');
  }

  const token = await generateJwtToken(admin.rows[0].id);

  console.log(`Admin ${username} authenticated successfully.`);
  return token;
}

export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    const decoded = await jwt.verify(token, tokenOptions.secretKey);
    console.log('Token is valid:', decoded);
    return true;
  } catch (error) {
    throw new ApiError(401, 'Token inválido ou expirado.');
  }
}