# Student Deadline Tracker

Ứng dụng quản lý deadline bài tập cá nhân — LTWNC, Bài thực hành 01 (N2).

React 19 · TypeScript · Redux Toolkit · Vite

## Chạy dự án

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit test (Vitest)
npm run build    # type-check + build
```

## Cấu trúc (feature-based)

```
src/
├── app/
│   ├── store.ts                  # configureStore, RootState, AppDispatch
│   └── hooks.ts                  # useAppDispatch, useAppSelector (typed hooks)
├── hooks/
│   └── useForm.ts                # custom hook generic useForm<T>
└── features/assignments/
    ├── types.ts                  # kiểu dữ liệu, utility types, type guard
    ├── deadline.ts               # tính "Còn X ngày / Quá hạn Y ngày", logic lọc
    ├── assignmentApi.ts          # API giả lập (trễ 800ms)
    ├── assignmentsSlice.ts       # slice, createAsyncThunk, selectors
    └── components/
        ├── AssignmentCard.tsx    # Compound Component
        ├── AssignmentList.tsx
        ├── AssignmentForm.tsx
        └── FilterTabs.tsx
```

## Kỹ thuật đã áp dụng

| Nội dung | Vị trí |
|---|---|
| Generic | `useForm<T>` và `register<K extends keyof T>` ([useForm.ts](src/hooks/useForm.ts)); `delay<T>` ([assignmentApi.ts](src/features/assignments/assignmentApi.ts)) |
| Utility types | `Omit<Assignment, 'id' \| 'completed'>`, `Record<keyof NewAssignment, string>`, `Record<Priority, string>`, `Partial<Record<keyof T, string>>` |
| Type guard | `isPriority`, `isAssignment` ([types.ts](src/features/assignments/types.ts)): kiểm tra dữ liệu `unknown` từ API và giá trị radio độ ưu tiên |
| Custom hook nâng cao | `useForm<T>`: quản lý giá trị, validate, xoá lỗi khi gõ, đưa focus về ô lỗi đầu tiên, `register()` trả về props (kèm `aria-invalid`) cho input |
| Compound Component | `<AssignmentCard>` và `.Toggle`, `.Title`, `.Subject`, `.Priority`, `.Status`, `.Deadline`, `.Delete` dùng chung Context |
| Redux Toolkit | `createSlice` (có `prepare` sinh id), `createSelector` (lọc, đếm theo bộ lọc, gợi ý môn học), typed hooks `withTypes` |
| createAsyncThunk | `fetchAssignments`: xử lý pending / fulfilled / rejected, `rejectValue` có kiểu, `condition` để chỉ gọi 1 lần |

## Quy ước lọc

- **Chưa hoàn thành**: chưa xong, chưa quá hạn
- **Quá hạn**: chưa xong, hạn nộp đã qua
- **Đã hoàn thành**: đã đánh dấu xong

Ba nhóm này không trùng nhau. Hạn nộp tính theo ngày: hạn hôm nay hiển thị "Còn 0 ngày".
