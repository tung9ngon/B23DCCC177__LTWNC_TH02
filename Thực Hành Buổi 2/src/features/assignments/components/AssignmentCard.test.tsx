import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeAssignment } from '../../../test/utils';
import { usePinStore } from '../../pins/usePinStore';
import { AssignmentCard } from './AssignmentCard';

function setup(overrides = {}) {
  const assignment = makeAssignment({ title: 'Bài thực hành 02', subject: 'Lập trình Web', priority: 'high', ...overrides });
  const onToggle = jest.fn();
  const onDelete = jest.fn();
  render(
    <ul>
      <AssignmentCard assignment={assignment} onToggle={onToggle} onDelete={onDelete} />
    </ul>,
  );
  return { assignment, onToggle, onDelete, user: userEvent.setup() };
}

beforeEach(() => usePinStore.setState({ pinnedIds: [] }));

describe('AssignmentCard', () => {
  it('hiển thị tên bài, môn, độ ưu tiên và số ngày còn lại', () => {
    setup();
    expect(screen.getByRole('heading', { name: 'Bài thực hành 02' })).toBeInTheDocument();
    expect(screen.getByText('Lập trình Web')).toBeInTheDocument();
    expect(screen.getByText('Ưu tiên cao')).toBeInTheDocument();
    expect(screen.getByText('Còn 3 ngày')).toBeInTheDocument();
    expect(screen.queryByText('Đã hoàn thành')).not.toBeInTheDocument();
  });

  it('bấm ô hoàn thành gọi onToggle với id của bài', async () => {
    const { assignment, onToggle, user } = setup();
    await user.click(screen.getByRole('checkbox', { name: /Hoàn thành: Bài thực hành 02/ }));
    expect(onToggle).toHaveBeenCalledWith(assignment.id);
  });

  it('bấm nút ghim: lưu vào usePinStore và đổi trạng thái nút', async () => {
    const { assignment, user } = setup();
    const pin = screen.getByRole('button', { name: 'Ghim Bài thực hành 02' });
    expect(pin).toHaveAttribute('aria-pressed', 'false');

    await user.click(pin);
    expect(usePinStore.getState().isPinned(assignment.id)).toBe(true);
    expect(pin).toHaveAttribute('aria-pressed', 'true');
  });

  it('nút xoá chỉ gọi onDelete khi người dùng xác nhận', async () => {
    const { assignment, onDelete, user } = setup();
    const confirm = jest.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    const del = screen.getByRole('button', { name: 'Xoá Bài thực hành 02' });

    await user.click(del);
    expect(onDelete).not.toHaveBeenCalled();
    await user.click(del);
    expect(onDelete).toHaveBeenCalledWith(assignment.id);
    confirm.mockRestore();
  });
});
