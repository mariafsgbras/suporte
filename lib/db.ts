import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'dev.sgbras.com',
  user: 'maria.fernanda',
  password: 'maria.Fernanda#101025',
  database: 'novo_suporte',
  waitForConnections: true,
  connectionLimit: 10,
});
