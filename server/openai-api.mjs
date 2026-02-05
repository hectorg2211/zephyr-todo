import OpenAI from 'openai';

const PARSE_SYSTEM = `You extract todo items from the user's message. Return ONLY a JSON array of strings, one string per todo. No other text. Example: ["Buy milk", "Call mom"]`;

const BREAK_DOWN_SYSTEM = `You break a single task into 2-5 concrete subtasks. Return ONLY a JSON array of strings, one string per subtask. No other text.`;

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY. Add it to your .env file.');
  }
  return new OpenAI({ apiKey });
}

async function chat(system, user) {
  const openai = getClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    max_tokens: 500,
  });
  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from OpenAI');
  return content;
}

function parseJsonArray(raw) {
  const trimmed = raw.replace(/^```\w*\n?|\n?```$/g, '').trim();
  const parsed = JSON.parse(trimmed);
  if (!Array.isArray(parsed)) throw new Error('Response is not an array');
  return parsed
    .filter((x) => typeof x === 'string')
    .map((s) => String(s).trim())
    .filter(Boolean);
}

export async function handleParse(body) {
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!text) return { todos: [] };
  const content = await chat(PARSE_SYSTEM, text);
  const todos = parseJsonArray(content);
  return { todos };
}

export async function handleBreakDown(body) {
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  if (!title) return { subtasks: [] };
  const content = await chat(BREAK_DOWN_SYSTEM, `Task: ${title}`);
  const subtasks = parseJsonArray(content);
  return { subtasks };
}
