// lib/db.ts
import sql, { ConnectionPool, config as SqlConfig } from 'mssql';

// Configuración de la base de datos
const config: SqlConfig = {
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  server: process.env.DB_SERVER as string,
  database: process.env.DB_DATABASE as string,
  options: {
    encrypt: false, 
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
  },
};

let connectionPool: ConnectionPool | null = null;

// Obtener conexión a la base de datos
export async function getDbConnection(): Promise<ConnectionPool> {
  if (!connectionPool) {
    connectionPool = await sql.connect(config);
  }
  return connectionPool;
}