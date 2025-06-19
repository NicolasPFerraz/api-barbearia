import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Função para testar e exibir status da conexão com o banco
export async function testDbConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('\x1b[32m%s\x1b[0m', '✅ Conexão com o banco de dados Neon estabelecida com sucesso!');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Erro ao conectar no banco de dados Neon:', error);
    process.exit(1);
  }
}

testDbConnection();