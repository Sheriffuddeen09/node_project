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

Respond ONLY with a valid JSON object with keys:
"sql", "summary", "chartType", "labels", "data".
No other text.
`;

  const chat = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are an assistant that MUST respond ONLY with valid JSON.' },
      { role: 'user', content: prompt }
    ],
  });

  const raw = chat.choices[0].message.content;
  console.log('[LLM] raw →', raw);

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in LLM response');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new Error(`Bad JSON from LLM: ${e.message}\nExtracted JSON:\n${jsonMatch[0]}`);
  }
}
