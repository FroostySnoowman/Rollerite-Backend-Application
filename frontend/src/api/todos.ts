export type Todo = {
  id: string
  title: string
  created_at: number
  updated_at: number
}

function apiBase(): string {
  const raw = import.meta.env.VITE_API_URL?.trim() ?? ''
  return raw.replace(/\/$/, '')
}

function url(path: string): string {
  const base = apiBase()
  if (!base) return path
  return `${base}${path}`
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string }
    if (data?.error) return data.error
  } catch {
    // ignore
  }
  return res.statusText || 'Request failed'
}

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(url('/api/todos'))
  if (!res.ok) throw new Error(await parseError(res))
  return (await res.json()) as Todo[]
}

export async function createTodo(title: string): Promise<Todo> {
  const res = await fetch(url('/api/todos'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return (await res.json()) as Todo
}

export async function updateTodo(id: string, title: string): Promise<Todo> {
  const res = await fetch(url(`/api/todos/${encodeURIComponent(id)}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return (await res.json()) as Todo
}

export async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(url(`/api/todos/${encodeURIComponent(id)}`), {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error(await parseError(res))
}
