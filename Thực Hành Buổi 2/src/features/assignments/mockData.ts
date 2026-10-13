import { nanoid } from '@reduxjs/toolkit';
import { toDateKey } from './deadline';
import { PRIORITIES, type Assignment } from './types';

const SUBJECTS = [
  'Lập trình Web nâng cao',
  'Cơ sở dữ liệu phân tán',
  'Trí tuệ nhân tạo',
  'Kiến trúc và thiết kế phần mềm',
  'An toàn bảo mật hệ thống thông tin',
  'Phát triển phần mềm hướng dịch vụ',
  'Tiếng Anh chuyên ngành',
];

const KINDS = ['Bài tập', 'Bài thực hành', 'Quiz', 'Báo cáo', 'Đồ án nhỏ'];

/** Sinh dữ liệu cho chế độ stress test: hạn nộp ngẫu nhiên từ 30 ngày trước đến 60 ngày sau */
export function generateMockAssignments(count: number, today: Date = new Date()): Assignment[] {
  return Array.from({ length: count }, (_, i) => {
    const deadline = new Date(today);
    deadline.setDate(today.getDate() + Math.floor(Math.random() * 91) - 30);
    return {
      id: nanoid(),
      subject: SUBJECTS[i % SUBJECTS.length],
      title: `${KINDS[i % KINDS.length]} số ${i + 1}`,
      deadline: toDateKey(deadline),
      priority: PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)],
      completed: Math.random() < 0.3,
    };
  });
}
