import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Todo } from '../types/todo';
import { SortableTodoItem } from './SortableTodoItem';

type TodoListProps = {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onBreakDown?: (id: string, title: string) => void;
  breakingDownId: string | null;
};

export function TodoList({
  todos,
  onToggle,
  onDelete,
  onReorder,
  onBreakDown,
  breakingDownId,
}: TodoListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over == null || active.id === over.id) return;
    const ordered = [...todos].sort((a, b) => a.order - b.order);
    const oldIndex = ordered.findIndex((t) => t.id === active.id);
    const newIndex = ordered.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const [removed] = ordered.splice(oldIndex, 1);
    ordered.splice(newIndex, 0, removed);
    onReorder(ordered.map((t) => t.id));
  };

  const sortedTodos = [...todos].sort((a, b) => a.order - b.order);
  const ids = sortedTodos.map((t) => t.id);

  return (
    <section className="bg-[var(--color-app-surface)] border border-[var(--color-app-border)] rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-app-text-muted)] m-0">Tasks</h2>
        <span className="text-[13px] text-[var(--color-app-text-muted)]" aria-live="polite">
          {todos.length} {todos.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>
      <ul className="m-0 p-0 list-none" aria-label="Todo list">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {sortedTodos.map((todo) => (
              <SortableTodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onBreakDown={onBreakDown}
                isBreakingDown={breakingDownId === todo.id}
              />
            ))}
          </SortableContext>
        </DndContext>
      </ul>
    </section>
  );
}
