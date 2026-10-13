import { configureStore } from '@reduxjs/toolkit';
import { logger } from 'redux-logger';
import assignmentsReducer from '../features/assignments/assignmentsSlice';

export const store = configureStore({
  reducer: {
    assignments: assignmentsReducer,
  },
  // redux-logger chỉ bật khi chạy dev; bản build production không log
  middleware: (getDefaultMiddleware) =>
    import.meta.env.DEV ? getDefaultMiddleware().concat(logger) : getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
