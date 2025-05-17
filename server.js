import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import your helper functions
import { queryDB, getSchema } from './query.js';
import { askLLM } from './llm.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://node-project-1-f3zj.onrender.com'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    const schema = await getSchema();
    const llmResponse = await askLLM(question, schema);

    if (!llmResponse?.sql)
      return res.status(400).json({ error: 'LLM did not return SQL' });

    const result = await queryDB(llmResponse.sql);
    return res.json({ ...llmResponse, result });

  } catch (err) {
    console.error('/api/ask error:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
