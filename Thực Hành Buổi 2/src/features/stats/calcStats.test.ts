import type { Assignment } from '../assignments/types';
import { calcStats } from './calcStats';

const today = new Date(2026, 8, 22);

const make = (subject: string, deadline: string, completed = false): Assignment => ({
  id: `${subject}-${deadline}-${completed}`,
  subject,
  title: 'Bài',
  deadline,
  priority: 'low',
  completed,
});

describe('calcStats', () => {
  it('đếm đã xong, quá hạn, chưa xong và theo từng môn', () => {
    const stats = calcStats(
      [
        make('Web', '2026-09-20'), // quá hạn
        make('Web', '2026-09-20', true), // xong (dù quá hạn) → chỉ tính đã xong
        make('Web', '2026-09-30'), // chưa xong
        make('AI', '2026-09-22'), // hạn hôm nay → chưa quá hạn
      ],
      today,
    );

    expect(stats).toMatchObject({ total: 4, completed: 1, overdue: 1, pending: 2 });
    expect(stats.bySubject).toEqual([
      { subject: 'Web', total: 3, completed: 1, overdue: 1 },
      { subject: 'AI', total: 1, completed: 0, overdue: 0 },
    ]);
  });

  it('biên: danh sách rỗng trả về toàn số 0', () => {
    expect(calcStats([], today)).toEqual({ total: 0, completed: 0, overdue: 0, pending: 0, bySubject: [] });
  });
});
