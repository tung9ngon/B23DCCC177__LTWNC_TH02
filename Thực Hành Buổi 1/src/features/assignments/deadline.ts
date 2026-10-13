import type { Assignment, FilterStatus } from './types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** 'YYYY-MM-DD' → Date lúc 0h giờ địa phương (new Date('YYYY-MM-DD') parse theo UTC nên dễ lệch ngày) */
export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toDateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** 'Th 6, 25/09' — chỉ ghi năm khi khác năm hiện tại */
export function formatDate(key: string, today: Date = new Date()): string {
  const date = parseDateKey(key);
  const withYear = date.getFullYear() !== today.getFullYear();
  return date.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    ...(withYear && { year: 'numeric' }),
  });
}

/** Số ngày từ hôm nay đến hạn nộp: dương = còn hạn, 0 = hạn hôm nay, âm = đã qua hạn */
export function getDaysLeft(deadline: string, today: Date = new Date()): number {
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((parseDateKey(deadline).getTime() - startOfToday.getTime()) / MS_PER_DAY);
}

export function formatDaysLeft(daysLeft: number): string {
  return daysLeft >= 0 ? `Còn ${daysLeft} ngày` : `Quá hạn ${-daysLeft} ngày`;
}

export function isOverdue(assignment: Assignment, today: Date = new Date()): boolean {
  return !assignment.completed && getDaysLeft(assignment.deadline, today) < 0;
}

export function matchesFilter(assignment: Assignment, filter: FilterStatus, today: Date = new Date()): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'pending':
      return !assignment.completed && !isOverdue(assignment, today);
    case 'overdue':
      return isOverdue(assignment, today);
    case 'completed':
      return assignment.completed;
  }
}
