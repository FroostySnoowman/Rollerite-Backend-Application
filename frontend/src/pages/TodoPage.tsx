import { useCallback, useEffect, useId, useState } from 'react'
import {
  createTodo,
  deleteTodo,
  fetchTodos,
  updateTodo,
  type Todo,
} from '../api/todos'
import { Button } from '../components/ui/Button'
import { Container } from '../components/layout/Container'
import { Section } from '../components/layout/Section'

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [savingNew, setSavingNew] = useState(false)
  const formId = useId()

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const list = await fetchTodos()
      setTodos(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load todos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title || savingNew) return
    setSavingNew(true)
    setError(null)
    try {
      const created = await createTodo(title)
      setTodos((prev) => [...prev, created])
      setNewTitle('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add item')
    } finally {
      setSavingNew(false)
    }
  }

  return (
    <>
      <Section
        id="tasks"
        className="border-b-[length:var(--border-width)] border-[var(--border)] bg-[var(--surface-muted)]"
      >
        <Container>
          <header className="mb-8 min-w-0">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--fg)] sm:text-4xl">
              Tasks
            </h1>
            <p className="mt-2 max-w-xl text-[var(--fg-muted)]">
              Add, edit, or remove items.
            </p>
          </header>

          {error ? (
            <div
              className="neu-card-sm mb-6 border-[var(--accent)] bg-[var(--surface-muted)] p-4 text-[var(--fg)]"
              role="alert"
            >
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-1 text-sm text-[var(--fg-muted)]">{error}</p>
              <Button type="button" variant="secondary" className="mt-4" onClick={() => void load()}>
                Retry
              </Button>
            </div>
          ) : null}

          <form
            onSubmit={handleAdd}
            className="neu-card flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:gap-4"
            aria-labelledby={`${formId}-legend`}
          >
            <fieldset className="min-w-0 flex-1 border-0 p-0">
              <legend id={`${formId}-legend`} className="sr-only">
                Add a new todo
              </legend>
              <label
                htmlFor={`${formId}-new-title`}
                className="mb-2 block font-display text-xs font-bold uppercase tracking-wider text-[var(--accent-2)]"
              >
                New item
              </label>
              <input
                id={`${formId}-new-title`}
                className="input-todo"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What needs doing?"
                maxLength={500}
                autoComplete="off"
                disabled={savingNew}
              />
            </fieldset>
            <Button type="submit" disabled={savingNew || !newTitle.trim()}>
              {savingNew ? 'Adding…' : 'Add'}
            </Button>
          </form>
        </Container>
      </Section>

      <Section className="bg-[var(--bg-page)]">
        <Container>
          {loading ? (
            <div className="pageFallback min-h-[12rem] rounded-[var(--radius)] border-[length:var(--border-width)] border-dashed border-[var(--border)] bg-[var(--surface-muted)]/50">
              Loading todos…
            </div>
          ) : todos.length === 0 ? (
            <div className="neu-card-sm p-8 text-center text-[var(--fg-muted)]">
              No todos yet. Add one above.
            </div>
          ) : (
            <ul className="space-y-4" aria-label="Todo items">
              {todos.map((todo) => (
                <TodoRow key={todo.id} todo={todo} onChange={load} onError={setError} />
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </>
  )
}

type RowProps = {
  todo: Todo
  onChange: () => Promise<void>
  onError: (msg: string | null) => void
}

function TodoRow({ todo, onChange, onError }: RowProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!editing) setDraft(todo.title)
  }, [todo.title, editing])

  async function save() {
    const title = draft.trim()
    if (!title || busy) return
    setBusy(true)
    onError(null)
    try {
      await updateTodo(todo.id, title)
      setEditing(false)
      await onChange()
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Could not save changes')
    } finally {
      setBusy(false)
    }
  }

  function cancel() {
    setDraft(todo.title)
    setEditing(false)
  }

  async function remove() {
    if (
      !window.confirm(
        `Remove “${todo.title.length > 60 ? `${todo.title.slice(0, 60)}…` : todo.title}”?`,
      )
    ) {
      return
    }
    setBusy(true)
    onError(null)
    try {
      await deleteTodo(todo.id)
      await onChange()
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Could not delete item')
    } finally {
      setBusy(false)
    }
  }

  const rowId = `todo-${todo.id}`

  return (
    <li className="neu-card flex min-w-0 flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label htmlFor={rowId} className="sr-only">
              Edit title for todo
            </label>
            <input
              id={rowId}
              className="input-todo sm:max-w-xl sm:flex-1"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={500}
              disabled={busy}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void save()} disabled={busy || !draft.trim()}>
                Save
              </Button>
              <Button type="button" variant="secondary" onClick={cancel} disabled={busy}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="break-words text-[var(--fg)]">{todo.title}</p>
        )}
      </div>
      {!editing ? (
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <Button type="button" variant="secondary" onClick={() => setEditing(true)} disabled={busy}>
            Edit
          </Button>
          <Button type="button" variant="danger" onClick={() => void remove()} disabled={busy}>
            Remove
          </Button>
        </div>
      ) : null}
    </li>
  )
}
