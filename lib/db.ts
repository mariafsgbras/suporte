/*import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'dev.sgbras.com',
  user: 'maria.fernanda',
  password: 'maria.Fernanda#101025',
  database: 'novo_suporte',
  waitForConnections: true,
  connectionLimit: 10,
});

import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: '127.0.0.1',
  port: 3806,
  user: 'suporte',
  password: 'Sgbras2026#',
  database: 'suporte',
  waitForConnections: true,
  connectionLimit: 10,
});*/

import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});