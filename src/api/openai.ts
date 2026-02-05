const API_BASE = '';

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as T | { error?: string };
  if (!res.ok) {
    const msg = data && typeof (data as { error?: string }).error === 'string'
      ? (data as { error: string }).error
      : 'Something went wrong.';
    throw new Error(msg);
  }
  return data as T;
}

export async function parseTodosFromText(userText: string): Promise<string[]> {
  if (!userText.trim()) return [];
  const { todos } = await post<{ todos: string[] }>('/api/openai/parse', { text: userText });
  return todos ?? [];
}

export async function breakDownTask(taskTitle: string): Promise<string[]> {
  if (!taskTitle.trim()) return [];
  const { subtasks } = await post<{ subtasks: string[] }>('/api/openai/break-down', { title: taskTitle });
  return subtasks ?? [];
}
