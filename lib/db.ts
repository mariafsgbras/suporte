/*import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'dev.sgbras.com',
  user: 'maria.fernanda',
  password: 'maria.Fernanda#101025',
  database: 'novo_suporte',
  waitForConnections: true,
  connectionLimit: 10,
});*/

import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: '178.156.186.246',
  user: 'root',
  password: 'NCKkitRnLikdJEvRsWAq03062025',
  database: 'suporte',
  waitForConnections: true,
  connectionLimit: 10,
});
