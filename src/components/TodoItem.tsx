import { forwardRef } from 'react'
import type { Todo } from '../types/todo'

type TodoItemProps = {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onBreakDown?: (id: string, title: string) => void
  isBreakingDown?: boolean
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
  isDragging?: boolean
  style?: React.CSSProperties
}

export const TodoItem = forwardRef<HTMLLIElement, TodoItemProps>(function TodoItem(
  { todo, onToggle, onDelete, onBreakDown, isBreakingDown = false, dragHandleProps, isDragging = false, style },
  ref,
) {
  return (
    <li
      ref={ref}
      style={style}
      className={`
        flex items-center gap-3 px-4 py-3 list-none bg-[var(--color-app-surface)] border border-[var(--color-app-border)] rounded-lg mb-2
        transition-[border-color,box-shadow,transform]
        hover:shadow-md
        ${isDragging ? 'opacity-85 shadow-xl scale-[1.01] z-10' : ''}
        ${todo.completed ? '[&_.todo-title]:line-through [&_.todo-title]:text-[var(--color-app-text-muted)]' : ''}
      `}
      data-id={todo.id}
    >
      {dragHandleProps && (
        <button
          type='button'
          className='p-1.5 rounded-md border-none bg-transparent text-[var(--color-app-text-muted)] opacity-60 cursor-grab active:cursor-grabbing hover:opacity-100 hover:text-[var(--color-app-text)] hover:bg-[var(--color-app-surface-hover)]'
          aria-label='Drag to reorder'
          {...dragHandleProps}
        >
          <span aria-hidden className='text-base leading-none tracking-tighter'>
            ⋮⋮
          </span>
        </button>
      )}
      <input
        type='checkbox'
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
        className='w-[18px] h-[18px] shrink-0 cursor-pointer accent-[var(--color-app-accent)]'
      />
      <span className='todo-title flex-1 text-left break-words text-[15px] leading-snug'>{todo.title}</span>
      <div className='flex gap-1.5 shrink-0'>
        {onBreakDown && (
          <button
            type='button'
            className='px-2.5 py-1.5 text-[13px] font-medium rounded-md border-none bg-transparent text-[var(--color-app-text-muted)] cursor-pointer hover:bg-[var(--color-app-accent-muted)] hover:text-[var(--color-app-accent)] disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={() => onBreakDown(todo.id, todo.title)}
            disabled={isBreakingDown}
            aria-label={`Break down "${todo.title}" into subtasks`}
          >
            {isBreakingDown ? '…' : 'Break down'}
          </button>
        )}
        <button
          type='button'
          className='px-2.5 py-1.5 text-[13px] font-medium rounded-md border-none bg-transparent text-[var(--color-app-text-muted)] cursor-pointer hover:bg-[var(--color-app-danger)]/10 hover:text-[var(--color-app-danger)]'
          onClick={() => onDelete(todo.id)}
          aria-label={`Delete "${todo.title}"`}
        >
          Delete
        </button>
      </div>
    </li>
  )
})
