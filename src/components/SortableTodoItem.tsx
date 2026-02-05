import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Todo } from '../types/todo';
import { TodoItem } from './TodoItem';

type SortableTodoItemProps = {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onBreakDown?: (id: string, title: string) => void;
  isBreakingDown: boolean;
};

export function SortableTodoItem({
  todo,
  onToggle,
  onDelete,
  onBreakDown,
  isBreakingDown,
}: SortableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TodoItem
      ref={setNodeRef}
      style={style}
      todo={todo}
      onToggle={onToggle}
      onDelete={onDelete}
      onBreakDown={onBreakDown}
      isBreakingDown={isBreakingDown}
      dragHandleProps={{ ...attributes, ...listeners }}
      isDragging={isDragging}
    />
  );
}
