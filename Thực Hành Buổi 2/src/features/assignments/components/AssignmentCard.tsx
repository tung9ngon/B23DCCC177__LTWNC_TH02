import { createContext, useContext } from 'react';
import { usePinStore } from '../../pins/usePinStore';
import { calcDaysLeft, formatDate, formatDaysLeft, isOverdue } from '../deadline';
import { PRIORITIES, PRIORITY_LABELS, type Assignment } from '../types';

interface AssignmentCardContextValue {
  assignment: Assignment;
  daysLeft: number;
}

const AssignmentCardContext = createContext<AssignmentCardContextValue | null>(null);

function useAssignmentCard(): AssignmentCardContextValue {
  const ctx = useContext(AssignmentCardContext);
  if (!ctx) throw new Error('AssignmentCard.* phải được đặt bên trong <AssignmentCard>');
  return ctx;
}

interface AssignmentCardProps {
  assignment: Assignment;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

/** Thẻ bài tập ghép từ các phần con dùng chung Context (Compound Component) */
export function AssignmentCard({ assignment, onToggle, onDelete }: AssignmentCardProps) {
  const daysLeft = calcDaysLeft(assignment.deadline);
  const className = ['task', assignment.completed && 'is-done', isOverdue(assignment) && 'is-overdue']
    .filter(Boolean)
    .join(' ');

  return (
    <AssignmentCardContext.Provider value={{ assignment, daysLeft }}>
      <li className={className}>
        <Toggle onToggle={onToggle} />
        <div className="task__main">
          <Title />
          <p className="task__meta">
            <Subject />
            <Priority />
            <Status />
          </p>
        </div>
        <Deadline />
        <Pin />
        <Delete onDelete={onDelete} />
      </li>
    </AssignmentCardContext.Provider>
  );
}

function Toggle({ onToggle }: { onToggle: (id: string) => void }) {
  const { assignment } = useAssignmentCard();
  return (
    <label className="task__check" title={assignment.completed ? 'Bỏ đánh dấu' : 'Đánh dấu hoàn thành'}>
      <input type="checkbox" checked={assignment.completed} onChange={() => onToggle(assignment.id)} />
      <span className="sr-only">Hoàn thành: {assignment.title}</span>
    </label>
  );
}

function Title() {
  const { assignment } = useAssignmentCard();
  return <h3 className="task__title">{assignment.title}</h3>;
}

function Subject() {
  const { assignment } = useAssignmentCard();
  return <span className="task__subject">{assignment.subject}</span>;
}

function Priority() {
  const { assignment } = useAssignmentCard();
  const level = PRIORITIES.indexOf(assignment.priority) + 1;
  return (
    <span className={`priority priority--${assignment.priority}`}>
      <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
        {[4, 7, 10].map((h, i) => (
          <rect key={h} x={1 + i * 4} y={11 - h} width="2.5" height={h} rx="0.6" className={i < level ? 'on' : ''} />
        ))}
      </svg>
      Ưu tiên {PRIORITY_LABELS[assignment.priority].toLowerCase()}
    </span>
  );
}

function Status() {
  const { assignment } = useAssignmentCard();
  if (!assignment.completed) return null;
  return (
    <span className="task__status">
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Đã hoàn thành
    </span>
  );
}

function Deadline() {
  const { assignment, daysLeft } = useAssignmentCard();
  let tone = 'normal';
  if (assignment.completed) tone = 'muted';
  else if (daysLeft < 0) tone = 'danger';
  else if (daysLeft <= 2) tone = 'warning';

  return (
    <div className="task__due">
      <span className={`task__countdown tone-${tone}`}>{formatDaysLeft(daysLeft)}</span>
      <time className="task__date" dateTime={assignment.deadline}>
        {formatDate(assignment.deadline)}
      </time>
    </div>
  );
}

function Pin() {
  const { assignment } = useAssignmentCard();
  const pinned = usePinStore((state) => state.isPinned(assignment.id));
  const togglePin = usePinStore((state) => state.togglePin);

  return (
    <button
      type="button"
      className="icon-btn icon-btn--pin"
      onClick={() => togglePin(assignment.id)}
      aria-pressed={pinned}
      aria-label={`Ghim ${assignment.title}`}
      title={pinned ? 'Bỏ ghim' : 'Ghim lên đầu danh sách'}
    >
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 3h6M8 3v4.5L5.5 11h9L12 7.5V3" fill={pinned ? 'currentColor' : 'none'} />
        <path d="M10 11v6" fill="none" />
      </svg>
    </button>
  );
}

function Delete({ onDelete }: { onDelete: (id: string) => void }) {
  const { assignment } = useAssignmentCard();
  const handleClick = () => {
    if (window.confirm(`Xoá bài tập "${assignment.title}"?`)) onDelete(assignment.id);
  };

  return (
    <button type="button" className="icon-btn" onClick={handleClick} aria-label={`Xoá ${assignment.title}`} title="Xoá">
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 5.5h13M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M5 5.5l.7 10.6a1 1 0 0 0 1 .9h6.6a1 1 0 0 0 1-.9L15 5.5M8.5 9v4.5M11.5 9v4.5" />
      </svg>
    </button>
  );
}
