import { pool } from '../db';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

export const generateJwtToken = async (id: string): Promise<string> => {
  const token = await jwt.sign({ id }, 'chave-super-secreta', { expiresIn: '7d' });
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
    console.log(`Generated JWT token: ${token}`);
    return token;
  } catch (error) {
    console.error('Error authenticating admin:', error);
    throw error;
  }
}
