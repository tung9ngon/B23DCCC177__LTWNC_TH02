import { describe, expect, it } from 'vitest';
import { formatDaysLeft, getDaysLeft, matchesFilter } from './deadline';
import { FILTERS, type Assignment } from './types';

const today = new Date(2026, 8, 22, 15, 30); // 22/09/2026, giữa ngày

const make = (deadline: string, completed = false): Assignment => ({
  id: deadline + completed,
  subject: 'Môn',
  title: 'Bài',
  deadline,
  priority: 'medium',
  completed,
});

describe('getDaysLeft', () => {
  it('tính theo ngày, không phụ thuộc giờ trong ngày', () => {
    expect(getDaysLeft('2026-09-22', today)).toBe(0);
    expect(getDaysLeft('2026-09-25', today)).toBe(3);
    expect(getDaysLeft('2026-09-20', today)).toBe(-2);
  });

  it('đúng khi qua tháng/năm', () => {
    expect(getDaysLeft('2026-10-01', today)).toBe(9);
    expect(getDaysLeft('2027-01-01', new Date(2026, 11, 31))).toBe(1);
  });
});

describe('formatDaysLeft', () => {
  it('hiển thị "Còn X ngày" hoặc "Quá hạn Y ngày"', () => {
    expect(formatDaysLeft(3)).toBe('Còn 3 ngày');
    expect(formatDaysLeft(0)).toBe('Còn 0 ngày');
    expect(formatDaysLeft(-2)).toBe('Quá hạn 2 ngày');
  });
});

describe('matchesFilter', () => {
  const upcoming = make('2026-09-25');
  const dueToday = make('2026-09-22');
  const overdue = make('2026-09-20');
  const doneLate = make('2026-09-20', true);
  const all = [upcoming, dueToday, overdue, doneLate];

  const pick = (filter: (typeof FILTERS)[number]) => all.filter((a) => matchesFilter(a, filter, today));

  it('lọc đúng từng trạng thái', () => {
    expect(pick('all')).toEqual(all);
    expect(pick('pending')).toEqual([upcoming, dueToday]);
    expect(pick('overdue')).toEqual([overdue]);
    expect(pick('completed')).toEqual([doneLate]);
  });

  it('3 bộ lọc Chưa hoàn thành / Quá hạn / Đã hoàn thành chia hết danh sách, không trùng', () => {
    const total = pick('pending').length + pick('overdue').length + pick('completed').length;
    expect(total).toBe(all.length);
  });
});
