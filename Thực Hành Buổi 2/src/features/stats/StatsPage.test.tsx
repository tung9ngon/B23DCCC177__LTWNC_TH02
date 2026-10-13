import { screen } from '@testing-library/react';
import { dueIn, makeAssignment, makeStore, renderWithStore } from '../../test/utils';
import { StatsPage } from './StatsPage';

describe('StatsPage', () => {
  it('hiển thị số tổng, đã xong, quá hạn và bảng theo môn', () => {
    const items = [
      makeAssignment({ subject: 'Web', completed: true }),
      makeAssignment({ subject: 'Web', deadline: dueIn(-2) }),
      makeAssignment({ subject: 'AI' }),
    ];
    renderWithStore(<StatsPage />, makeStore({ items }));

    const value = (label: string) => screen.getByText(label, { selector: 'dt' }).nextElementSibling;
    expect(value('Tổng số bài')).toHaveTextContent('3');
    expect(value('Đã hoàn thành')).toHaveTextContent('1');
    expect(value('Quá hạn')).toHaveTextContent('1');
    expect(screen.getByRole('row', { name: 'Web 2 1 1' })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: 'AI 1 0 0' })).toBeInTheDocument();
  });

  it('chưa có bài thì báo trống', () => {
    renderWithStore(<StatsPage />, makeStore({ items: [] }));
    expect(screen.getByText('Chưa có bài tập nào để thống kê.')).toBeInTheDocument();
  });
});
