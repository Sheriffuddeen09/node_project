import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function askLLM(question, schema) {
  const prompt = `
Schema:
${schema}

Question:
${question}

Return valid JSON only:
{
  "sql": "...",
  "summary": "...",
  "chartType": "bar|line|pie|table",
  "labels": [...],
  "data": [...]
}`;
  const chat = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',          // ✅ universally available
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = chat.choices[0].message.content;
  console.log('[LLM] raw →', raw);

  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`Bad JSON from LLM: ${e.message}\n${raw}`);
  }
}
