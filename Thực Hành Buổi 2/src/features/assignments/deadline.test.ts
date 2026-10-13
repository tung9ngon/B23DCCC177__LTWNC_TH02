import { calcDaysLeft, formatDaysLeft, isOverdue, matchesFilter, matchesSearch } from './deadline';
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

describe('calcDaysLeft', () => {
  it('tính theo ngày, không phụ thuộc giờ trong ngày', () => {
    expect(calcDaysLeft('2026-09-22', today)).toBe(0);
    expect(calcDaysLeft('2026-09-25', today)).toBe(3);
    expect(calcDaysLeft('2026-09-20', today)).toBe(-2);
  });

  it('đúng khi qua tháng/năm', () => {
    expect(calcDaysLeft('2026-10-01', today)).toBe(9);
    expect(calcDaysLeft('2027-01-01', new Date(2026, 11, 31))).toBe(1);
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

describe('isOverdue', () => {
  it('chỉ quá hạn khi chưa xong và hạn nộp đã qua', () => {
    expect(isOverdue(make('2026-09-21'), today)).toBe(true);
    expect(isOverdue(make('2026-09-21', true), today)).toBe(false);
  });

  it('biên: hạn nộp đúng hôm nay chưa tính là quá hạn', () => {
    expect(isOverdue(make('2026-09-22'), today)).toBe(false);
    expect(isOverdue(make('2026-09-22'), new Date(2026, 8, 22, 23, 59))).toBe(false);
  });
});

describe('matchesSearch', () => {
  const item = { ...make('2026-09-25'), title: 'Bài thực hành Redux', subject: 'Lập trình Web' };

  it('tìm theo tên bài hoặc môn, không phân biệt hoa thường', () => {
    expect(matchesSearch(item, 'redux')).toBe(true);
    expect(matchesSearch(item, 'LẬP TRÌNH')).toBe(true);
    expect(matchesSearch(item, 'java')).toBe(false);
  });

  it('chuỗi rỗng hoặc toàn khoảng trắng thì khớp tất cả', () => {
    expect(matchesSearch(item, '   ')).toBe(true);
  });
});
