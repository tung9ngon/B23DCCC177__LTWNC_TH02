import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStore } from '../../../test/utils';
import { AssignmentForm } from './AssignmentForm';

describe('AssignmentForm', () => {
  it('validate: để trống thì báo lỗi từng ô, đưa focus về ô lỗi đầu tiên, không thêm bài', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<AssignmentForm />);

    await user.click(screen.getByRole('button', { name: 'Thêm bài tập' }));

    expect(screen.getByText('Nhập tên môn học.')).toBeInTheDocument();
    expect(screen.getByText('Nhập tên bài tập.')).toBeInTheDocument();
    expect(screen.getByText('Chọn ngày hạn nộp.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Môn học/)).toHaveFocus();
    expect(screen.getByLabelText(/Môn học/)).toHaveAttribute('aria-invalid', 'true');
    expect(store.getState().assignments.items).toHaveLength(0);
  });

  it('validate: gõ lại vào ô lỗi thì lỗi của ô đó biến mất', async () => {
    const user = userEvent.setup();
    renderWithStore(<AssignmentForm />);

    await user.click(screen.getByRole('button', { name: 'Thêm bài tập' }));
    await user.type(screen.getByLabelText(/Tên bài tập/), 'T');

    expect(screen.queryByText('Nhập tên bài tập.')).not.toBeInTheDocument();
    expect(screen.getByText('Nhập tên môn học.')).toBeInTheDocument();
  });

  it('submit hợp lệ: thêm bài vào store (đã trim), xoá trắng form, báo đã thêm', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<AssignmentForm />);

    await user.type(screen.getByLabelText(/Môn học/), '  Lập trình Web  ');
    await user.type(screen.getByLabelText(/Tên bài tập/), 'Bài thực hành 02');
    await user.type(screen.getByLabelText(/Hạn nộp/), '2026-12-01');
    await user.click(screen.getByLabelText('Cao'));
    await user.click(screen.getByRole('button', { name: 'Thêm bài tập' }));

    expect(store.getState().assignments.items[0]).toMatchObject({
      subject: 'Lập trình Web',
      title: 'Bài thực hành 02',
      deadline: '2026-12-01',
      priority: 'high',
      completed: false,
    });
    expect(screen.getByRole('status')).toHaveTextContent('Đã thêm "Bài thực hành 02".');
    expect(screen.getByLabelText(/Tên bài tập/)).toHaveValue('');
  });
});
