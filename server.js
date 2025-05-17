import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';
import { queryDB, getSchema } from './query.js';
import { askLLM }             from './llm.js';
dotenv.config();

const app = express();

/* CORS – allow local dev and your deployed front‑end */
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://node-project-1-f3zj.onrender.com'   // ← put real FE URL
  ],
  methods: ['GET','POST','OPTIONS'],
  credentials: true,
}));

app.use(express.json());

app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    const schema      = await getSchema();
    const llmResponse = await askLLM(question, schema);

    if (!llmResponse.sql) return res.status(500).json({ error: 'LLM returned no SQL' });

    const result = await queryDB(llmResponse.sql);
    res.json({ ...llmResponse, result });

  } catch (err) {
    console.error('❌ /api/ask error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

/* ping endpoint */
app.get('/', (_, res) => res.send('API is live 🚀'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
