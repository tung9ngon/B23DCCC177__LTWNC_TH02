import { configureStore } from '@reduxjs/toolkit';
import reducer, {
  addAssignment,
  addManyAssignments,
  deleteAssignment,
  fetchAssignments,
  setFilter,
  toggleAssignment,
  type AssignmentsState,
} from './assignmentsSlice';
import { generateMockAssignments } from './mockData';
import { isAssignment } from './types';

const emptyState: AssignmentsState = { items: [], filter: 'all', status: 'idle', error: null };

describe('assignmentsSlice reducers', () => {
  it('thêm bài mới: sinh id, completed = false, đưa lên đầu danh sách', () => {
    const state = reducer(
      emptyState,
      addAssignment({ subject: 'Web', title: 'TH01', deadline: '2026-10-01', priority: 'high' }),
    );
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({ title: 'TH01', completed: false });
    expect(state.items[0].id).toBeTruthy();
  });

  it('đánh dấu / bỏ đánh dấu hoàn thành', () => {
    let state = reducer(
      emptyState,
      addAssignment({ subject: 'Web', title: 'TH01', deadline: '2026-10-01', priority: 'low' }),
    );
    const id = state.items[0].id;
    state = reducer(state, toggleAssignment(id));
    expect(state.items[0].completed).toBe(true);
    state = reducer(state, toggleAssignment(id));
    expect(state.items[0].completed).toBe(false);
  });

  it('xoá bài tập', () => {
    let state = reducer(
      emptyState,
      addAssignment({ subject: 'Web', title: 'TH01', deadline: '2026-10-01', priority: 'low' }),
    );
    state = reducer(state, deleteAssignment(state.items[0].id));
    expect(state.items).toHaveLength(0);
  });

  it('đổi bộ lọc', () => {
    expect(reducer(emptyState, setFilter('overdue')).filter).toBe('overdue');
  });

  it('thêm hàng loạt (stress test): nối vào cuối, giữ bài đang có', () => {
    let state = reducer(
      emptyState,
      addAssignment({ subject: 'Web', title: 'TH01', deadline: '2026-10-01', priority: 'low' }),
    );
    state = reducer(state, addManyAssignments(generateMockAssignments(1000)));
    expect(state.items).toHaveLength(1001);
    expect(state.items[0].title).toBe('TH01');
    expect(state.items.every(isAssignment)).toBe(true);
  });

  it('biên: id không tồn tại thì toggle / xoá không làm đổi state', () => {
    const state = reducer(
      emptyState,
      addAssignment({ subject: 'Web', title: 'TH01', deadline: '2026-10-01', priority: 'low' }),
    );
    expect(reducer(state, toggleAssignment('khong-co'))).toEqual(state);
    expect(reducer(state, deleteAssignment('khong-co')).items).toEqual(state.items);
  });

  it('biên: state undefined thì trả về state khởi tạo', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(emptyState);
  });
});

describe('isAssignment (type guard)', () => {
  it('nhận object hợp lệ, loại object sai kiểu', () => {
    const valid = { id: '1', subject: 'A', title: 'B', deadline: '2026-10-01', priority: 'high', completed: false };
    expect(isAssignment(valid)).toBe(true);
    expect(isAssignment({ ...valid, priority: 'urgent' })).toBe(false);
    expect(isAssignment({ ...valid, deadline: '01/10/2026' })).toBe(false);
    expect(isAssignment(null)).toBe(false);
  });
});

describe('fetchAssignments (createAsyncThunk)', () => {
  it('tải dữ liệu mẫu từ API giả lập và chỉ gọi một lần', async () => {
    const store = configureStore({ reducer: { assignments: reducer } });
    const first = store.dispatch(fetchAssignments());
    expect(store.getState().assignments.status).toBe('loading');
    store.dispatch(fetchAssignments()); // bị condition chặn
    await first;

    const { status, items } = store.getState().assignments;
    expect(status).toBe('succeeded');
    expect(items.length).toBeGreaterThan(0);
    expect(new Set(items.map((a) => a.id)).size).toBe(items.length);
  });
});
