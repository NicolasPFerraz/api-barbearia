import { pool } from '../db';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const tokenOptions = {
  secretKey: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRATION || '1h',
};

export const generateJwtToken = async (id: string): Promise<string> => {
  const token = await jwt.sign({ id }, tokenOptions.secretKey, { expiresIn: tokenOptions.expiresIn });
  return token;
}

export const authenticate = async (username: string, password: string): Promise<string> => {
  try {
    const admin = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    if (admin.rows.length === 0) {
      throw new Error('Admin not found');
    } 

    const isValidPassword = await bcrypt.compare(password, admin.rows[0].password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    const token = await generateJwtToken(admin.rows[0].id);

    console.log(`Admin ${username} authenticated successfully.`);
    return token;
  } catch (error) {
    console.error('Error authenticating admin:', error);
    throw error;
  }
}
