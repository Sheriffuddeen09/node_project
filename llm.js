import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

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
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  });

  const content = completion.choices[0].message.content;
  console.log('LLM response:', content);

  try {
    return JSON.parse(content);
  } catch (e) {
    throw new Error('Failed to parse LLM response as JSON: ' + e.message + '\nResponse:\n' + content);
  }
};
