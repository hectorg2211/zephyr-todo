import { useState, useEffect, useCallback } from 'react';
import type { Todo } from '../types/todo';

const STORAGE_KEY = 'todo-app-todos';

function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is Todo =>
        t != null &&
        typeof t === 'object' &&
        typeof t.id === 'string' &&
        typeof t.title === 'string' &&
        typeof t.completed === 'boolean' &&
        typeof t.order === 'number'
    );
  } catch {
    return [];
  }
}

function saveTodos(todos: Todo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const addTodo = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTodos((prev) => {
      const maxOrder = prev.length === 0 ? -1 : Math.max(...prev.map((t) => t.order));
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          title: trimmed,
          completed: false,
          order: maxOrder + 1,
        },
      ];
    });
  }, []);

  const addTodos = useCallback((titles: string[]) => {
    const toAdd = titles.map((t) => t.trim()).filter(Boolean);
    if (toAdd.length === 0) return;
    setTodos((prev) => {
      const maxOrder = prev.length === 0 ? -1 : Math.max(...prev.map((t) => t.order));
      return [
        ...prev,
        ...toAdd.map((title, i) => ({
          id: crypto.randomUUID(),
          title,
          completed: false as const,
          order: maxOrder + 1 + i,
        })),
      ];
    });
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const reorderTodos = useCallback((orderedIds: string[]) => {
    setTodos((prev) => {
      const byId = new Map(prev.map((t) => [t.id, t]));
      return orderedIds
        .map((id, index) => {
          const t = byId.get(id);
          return t ? { ...t, order: index } : null;
        })
        .filter((t): t is Todo => t != null);
    });
  }, []);

  const replaceTodoWithSubtasks = useCallback((idToReplace: string, subtaskTitles: string[]) => {
    const toAdd = subtaskTitles.map((t) => t.trim()).filter(Boolean);
    if (toAdd.length === 0) return;
    setTodos((prev) => {
      const idx = prev.findIndex((t) => t.id === idToReplace);
      if (idx < 0) return prev;
      const baseOrder = prev[idx].order;
      const newItems: Todo[] = toAdd.map((title, i) => ({
        id: crypto.randomUUID(),
        title,
        completed: false,
        order: baseOrder + i,
      }));
      const rest = prev.filter((t) => t.id !== idToReplace);
      const reordered = [...rest, ...newItems].sort((a, b) => a.order - b.order);
      return reordered.map((t, i) => ({ ...t, order: i }));
    });
  }, []);

  return {
    todos,
    addTodo,
    addTodos,
    toggleTodo,
    deleteTodo,
    reorderTodos,
    replaceTodoWithSubtasks,
  };
}
