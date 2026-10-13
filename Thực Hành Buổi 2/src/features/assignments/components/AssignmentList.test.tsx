import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeAssignment, makeStore, renderWithStore } from '../../../test/utils';
import { usePinStore } from '../../pins/usePinStore';
import { fetchAssignmentsApi } from '../assignmentApi';
import { fetchAssignments } from '../assignmentsSlice';
import { AssignmentList } from './AssignmentList';

jest.mock('../assignmentApi');
const mockedFetch = jest.mocked(fetchAssignmentsApi);

/** Render danh sách với store mới (status 'idle') rồi gọi thunk như App làm khi khởi động */
function renderAndFetch() {
  const result = renderWithStore(<AssignmentList />);
  act(() => {
    result.store.dispatch(fetchAssignments());
  });
  return result;
}

beforeEach(() => {
  mockedFetch.mockReset();
  usePinStore.setState({ pinnedIds: [] });
});

describe('AssignmentList với API mock', () => {
  it('đang tải: hiện khung chờ, chưa có bài nào', () => {
    mockedFetch.mockReturnValue(new Promise(() => {})); // không bao giờ trả về
    renderAndFetch();

    expect(screen.getByRole('status')).toHaveTextContent('Đang tải danh sách bài tập…');
    expect(screen.queryAllByRole('heading')).toHaveLength(0);
  });

  it('thành công: hiển thị các bài API trả về', async () => {
    mockedFetch.mockResolvedValue([makeAssignment({ title: 'Lab RSA' }), makeAssignment({ title: 'Quiz chương 3' })]);
    renderAndFetch();

    expect(await screen.findByRole('heading', { name: 'Lab RSA' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quiz chương 3' })).toBeInTheDocument();
    expect(screen.queryByText('Đang tải danh sách bài tập…')).not.toBeInTheDocument();
  });

  it('lỗi: hiển thị thông báo lỗi từ API', async () => {
    mockedFetch.mockRejectedValue(new Error('Mất kết nối máy chủ'));
    renderAndFetch();

    expect(await screen.findByText('Mất kết nối máy chủ')).toBeInTheDocument();
    expect(screen.queryAllByRole('heading')).toHaveLength(0);
  });
});

describe('AssignmentList: tìm kiếm và ghim', () => {
  const items = [
    makeAssignment({ title: 'Bài thực hành Redux', subject: 'Lập trình Web' }),
    makeAssignment({ title: 'Cài đặt A*', subject: 'Trí tuệ nhân tạo' }),
    makeAssignment({ title: 'Quiz chương 3', subject: 'Trí tuệ nhân tạo' }),
  ];
  const titles = () => screen.getAllByRole('heading').map((h) => h.textContent);

  it('bài đã ghim luôn đứng đầu danh sách', async () => {
    const user = userEvent.setup();
    renderWithStore(<AssignmentList />, makeStore({ items }));

    await user.click(screen.getByRole('button', { name: 'Ghim Quiz chương 3' }));
    expect(titles()).toEqual(['Quiz chương 3', 'Bài thực hành Redux', 'Cài đặt A*']);
  });

  it('lọc theo từ khoá; không có kết quả thì báo rõ', async () => {
    const user = userEvent.setup();
    renderWithStore(<AssignmentList />, makeStore({ items }));
    const search = screen.getByRole('searchbox', { name: 'Tìm bài tập' });

    await user.type(search, 'trí tuệ');
    expect(await screen.findAllByRole('heading')).toHaveLength(2);
    expect(within(screen.getByRole('list')).queryByText('Bài thực hành Redux')).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'java');
    expect(await screen.findByText('Không có bài tập nào khớp "java".')).toBeInTheDocument();
  });
});
