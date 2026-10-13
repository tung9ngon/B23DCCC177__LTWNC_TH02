export const PRIORITIES = ['low', 'medium', 'high'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const FILTERS = ['all', 'pending', 'overdue', 'completed'] as const;
export type FilterStatus = (typeof FILTERS)[number];

export interface Assignment {
  id: string;
  subject: string;
  title: string;
  /** Hạn nộp dạng 'YYYY-MM-DD' (theo giờ địa phương) */
  deadline: string;
  priority: Priority;
  completed: boolean;
}

/** Dữ liệu để tạo bài tập mới — id và completed do hệ thống sinh */
export type NewAssignment = Omit<Assignment, 'id' | 'completed'>;

/** Giá trị trên form: cùng các khoá với NewAssignment nhưng đều là chuỗi thô từ input */
export type AssignmentFormValues = Record<keyof NewAssignment, string>;

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
};

export const FILTER_LABELS: Record<FilterStatus, string> = {
  all: 'Tất cả',
  pending: 'Chưa hoàn thành',
  overdue: 'Quá hạn',
  completed: 'Đã hoàn thành',
};

export function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && (PRIORITIES as readonly string[]).includes(value);
}

/** Kiểm tra dữ liệu không rõ kiểu (vd. từ API) có đúng cấu trúc Assignment không */
export function isAssignment(value: unknown): value is Assignment {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.subject === 'string' &&
    typeof v.title === 'string' &&
    typeof v.deadline === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(v.deadline) &&
    isPriority(v.priority) &&
    typeof v.completed === 'boolean'
  );
}
