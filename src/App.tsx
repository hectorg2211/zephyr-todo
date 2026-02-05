import { useState } from 'react';
import { useTodos } from './hooks/useTodos';
import { TodoList } from './components/TodoList';
import { parseTodosFromText, breakDownTask } from './api/openai';

function App() {
  const { todos, addTodo, addTodos, toggleTodo, deleteTodo, reorderTodos, replaceTodoWithSubtasks } = useTodos();
  const [input, setInput] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [breakingDownId, setBreakingDownId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTodo(input);
    setInput('');
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiError(null);
    if (!aiInput.trim() || aiLoading) return;
    setAiLoading(true);
    try {
      const titles = await parseTodosFromText(aiInput);
      if (titles.length > 0) {
        addTodos(titles);
        setAiInput('');
      } else {
        setAiError('No tasks could be extracted. Try a different phrase.');
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleBreakDown = async (id: string, title: string) => {
    setAiError(null);
    setBreakingDownId(id);
    try {
      const subtasks = await breakDownTask(title);
      if (subtasks.length > 0) {
        replaceTodoWithSubtasks(id, subtasks);
      } else {
        setAiError('Could not break down this task.');
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBreakingDownId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center mb-1">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-app-text)]">Todo</h1>
      </header>

      <div className="bg-[var(--color-app-surface)] border border-[var(--color-app-border)] rounded-xl p-5 shadow-lg">
        <span className="block text-xs font-semibold uppercase tracking-widest text-[var(--color-app-text-muted)] mb-2">
          Quick add
        </span>
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a task…"
            className="flex-1 px-4 py-2.5 text-[15px] rounded-lg border border-[var(--color-app-border)] bg-[var(--color-app-bg)] text-[var(--color-app-text)] placeholder:text-[var(--color-app-text-muted)] focus:outline-none focus:border-[var(--color-app-accent)] focus:ring-[3px] focus:ring-[var(--color-app-accent-muted)]"
            aria-label="New task"
          />
          <button
            type="submit"
            className="px-4 py-2.5 text-[15px] font-semibold rounded-lg bg-[var(--color-app-accent)] text-[var(--color-app-bg)] hover:bg-[var(--color-app-accent-hover)] active:scale-[0.98] shrink-0"
          >
            Add
          </button>
        </form>
        <form onSubmit={handleAiSubmit} className="flex gap-2 items-center mt-2">
          <input
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="e.g. Buy milk, call mom, book flight"
            className="flex-1 px-4 py-2.5 text-[15px] rounded-lg border border-[var(--color-app-border)] bg-[var(--color-app-bg)] text-[var(--color-app-text)] placeholder:text-[var(--color-app-text-muted)] focus:outline-none focus:border-[var(--color-app-accent)] focus:ring-[3px] focus:ring-[var(--color-app-accent-muted)] disabled:opacity-60"
            aria-label="Add tasks with AI"
            disabled={aiLoading}
          />
          <button
            type="submit"
            className="px-4 py-2.5 text-[15px] font-semibold rounded-lg bg-[var(--color-app-accent-muted)] text-[var(--color-app-accent)] hover:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] shrink-0"
            disabled={aiLoading}
          >
            {aiLoading ? '…' : 'Add with AI'}
          </button>
        </form>
        {aiError && (
          <p
            className="mt-3 text-sm text-[var(--color-app-danger)] px-3 py-2 rounded-lg bg-[var(--color-app-danger)]/10 border border-[var(--color-app-danger)]/20"
            role="alert"
          >
            {aiError}
          </p>
        )}
      </div>

      <TodoList
        todos={todos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onReorder={reorderTodos}
        onBreakDown={handleBreakDown}
        breakingDownId={breakingDownId}
      />
    </div>
  );
}

export default App;
