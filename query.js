import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  host:     process.env.PGHOST,
  port:     Number(process.env.PGPORT) || 5432,
  user:     process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl:      { rejectUnauthorized: false }   // Render DBs require SSL
});

export async function queryDB(sql) {
  const { rows } = await pool.query(sql);
  return rows;
}

export async function getSchema() {
  const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'`);
  let schema = '';
  for (const { table_name } of tables.rows) {
    const cols = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = $1`, [table_name]);
    schema += `Table ${table_name}: ` +
              cols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', ') +
              '\n';
  }
  return schema;
}
