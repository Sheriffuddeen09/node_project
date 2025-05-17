import OpenAI from 'openai';
import pg from 'pg';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// ✅ Force IPv4 resolution to avoid ENETUNREACH on IPv6
dns.setDefaultResultOrder('ipv4first');

// ✅ Setup PostgreSQL pool
const pool = new pg.Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false, // Needed for Supabase
  },
});

// ✅ OpenAI setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const askLLM = async (question, schema) => {
  const prompt = `
Schema:\n${schema}
Question: ${question}
Generate SQL to answer the question and summarize the result in JSON:
{
  "sql": "...",
  "summary": "...",
  "chartType": "bar/pie/line/table",
  "labels": [...],
  "data": [...]
}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  const content = completion.choices[0].message.content;
  console.log("LLM response:", content);

  try {
    return JSON.parse(content);
  } catch (e) {
    throw new Error("Failed to parse LLM response as JSON: " + e.message + "\nResponse:\n" + content);
  }
};

// ✅ Test DB connection on server start
const testDB = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ DB connected, current time:", res.rows[0]);
  } catch (e) {
    console.error("❌ DB connection error:", e);
  }
};

testDB();

// ✅ Debug logs
console.log("OpenAI API Key set:", !!process.env.OPENAI_API_KEY);
console.log("DB Host:", process.env.PGHOST);
