import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: { rejectUnauthorized: false },
});

export const queryDB = async (sql) => {
  const res = await pool.query(sql);
  return res.rows;
};

export const getSchema = async () => {
  const tables = await pool.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);

  let schema = '';
  for (const row of tables.rows) {
    const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = '${row.table_name}'
    `);
    schema += `Table ${row.table_name}: ` +
              cols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', ') +
              '\n';
  }
  return schema;
};
