import { createAsyncThunk, createSelector, createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { fetchAssignmentsApi } from './assignmentApi';
import { matchesFilter } from './deadline';
import type { Assignment, FilterStatus, NewAssignment } from './types';

type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AssignmentsState {
  items: Assignment[];
  filter: FilterStatus;
  status: LoadStatus;
  error: string | null;
}

const initialState: AssignmentsState = {
  items: [],
  filter: 'all',
  status: 'idle',
  error: null,
};

const createAppAsyncThunk = createAsyncThunk.withTypes<{ state: RootState; rejectValue: string }>();

export const fetchAssignments = createAppAsyncThunk(
  'assignments/fetchAll',
  async (_: void, { rejectWithValue }) => {
    try {
      return await fetchAssignmentsApi();
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Không tải được danh sách bài tập');
    }
  },
  {
    // Chỉ tải một lần khi khởi động (StrictMode ở môi trường dev chạy effect 2 lần)
    condition: (_, { getState }) => getState().assignments.status === 'idle',
  },
);

const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    addAssignment: {
      reducer(state, action: PayloadAction<Assignment>) {
        state.items.unshift(action.payload);
      },
      prepare(input: NewAssignment) {
        return { payload: { ...input, id: nanoid(), completed: false } };
      },
    },
    /** Chế độ stress test: thêm hàng loạt bài tập mẫu vào cuối danh sách */
    addManyAssignments(state, action: PayloadAction<Assignment[]>) {
      state.items.push(...action.payload);
    },
    toggleAssignment(state, action: PayloadAction<string>) {
      const item = state.items.find((a) => a.id === action.payload);
      if (item) item.completed = !item.completed;
    },
    deleteAssignment(state, action: PayloadAction<string>) {
      state.items = state.items.filter((a) => a.id !== action.payload);
    },
    setFilter(state, action: PayloadAction<FilterStatus>) {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // push thay vì gán đè để không mất bài người dùng thêm trong lúc chờ API
        state.items.push(...action.payload);
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message ?? 'Lỗi không xác định';
      });
  },
});

export const { addAssignment, addManyAssignments, toggleAssignment, deleteAssignment, setFilter } =
  assignmentsSlice.actions;
export default assignmentsSlice.reducer;

export const selectFilter = (state: RootState) => state.assignments.filter;
export const selectLoadStatus = (state: RootState) => state.assignments.status;
export const selectLoadError = (state: RootState) => state.assignments.error;
export const selectItems = (state: RootState) => state.assignments.items;

export const selectVisibleAssignments = createSelector([selectItems, selectFilter], (items, filter) =>
  items.filter((a) => matchesFilter(a, filter)),
);

export const selectFilterCounts = createSelector([selectItems], (items) => {
  const count = (filter: FilterStatus) => items.filter((a) => matchesFilter(a, filter)).length;
  return {
    all: items.length,
    pending: count('pending'),
    overdue: count('overdue'),
    completed: count('completed'),
  } satisfies Record<FilterStatus, number>;
});

/** Các môn đã có — gợi ý khi nhập để khỏi gõ lại */
export const selectSubjects = createSelector([selectItems], (items) => [...new Set(items.map((a) => a.subject))]);
