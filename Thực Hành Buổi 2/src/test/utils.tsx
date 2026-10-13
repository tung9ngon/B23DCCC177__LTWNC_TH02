import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import assignmentsReducer, { type AssignmentsState } from '../features/assignments/assignmentsSlice';
import { toDateKey } from '../features/assignments/deadline';
import type { Assignment } from '../features/assignments/types';

/** Store riêng cho từng test (không có redux-logger như store thật) */
export function makeStore(assignments?: Partial<AssignmentsState>) {
  const preloaded: AssignmentsState = { items: [], filter: 'all', status: 'succeeded', error: null, ...assignments };
  return configureStore({
    reducer: { assignments: assignmentsReducer },
    preloadedState: assignments && { assignments: preloaded },
  });
}

export function renderWithStore(ui: ReactElement, store = makeStore()) {
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}

/** Ngày cách hôm nay `days` ngày, dạng 'YYYY-MM-DD' */
export function dueIn(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

let seq = 0;
export function makeAssignment(overrides: Partial<Assignment> = {}): Assignment {
  seq++;
  return {
    id: `a${seq}`,
    subject: 'Lập trình Web',
    title: `Bài ${seq}`,
    deadline: dueIn(3),
    priority: 'medium',
    completed: false,
    ...overrides,
  };
}
