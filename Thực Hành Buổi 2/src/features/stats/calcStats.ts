import { isOverdue } from '../assignments/deadline';
import type { Assignment } from '../assignments/types';

export interface SubjectStats {
  subject: string;
  total: number;
  completed: number;
  overdue: number;
}

export interface AssignmentStats {
  total: number;
  completed: number;
  overdue: number;
  /** Chưa xong và chưa quá hạn */
  pending: number;
  /** Nhiều bài nhất lên trước */
  bySubject: SubjectStats[];
}

export function calcStats(items: Assignment[], today: Date = new Date()): AssignmentStats {
  const bySubject = new Map<string, SubjectStats>();
  let completed = 0;
  let overdue = 0;

  for (const a of items) {
    const row = bySubject.get(a.subject) ?? { subject: a.subject, total: 0, completed: 0, overdue: 0 };
    row.total++;
    if (a.completed) {
      row.completed++;
      completed++;
    } else if (isOverdue(a, today)) {
      row.overdue++;
      overdue++;
    }
    bySubject.set(a.subject, row);
  }

  return {
    total: items.length,
    completed,
    overdue,
    pending: items.length - completed - overdue,
    bySubject: [...bySubject.values()].sort((x, y) => y.total - x.total || x.subject.localeCompare(y.subject, 'vi')),
  };
}
