# Student Deadline Tracker

Ứng dụng quản lý deadline bài tập cá nhân — LTWNC, Bài thực hành 02 (nâng cấp từ Bài thực hành 01).

React 19 · TypeScript · Redux Toolkit · Zustand · react-window · Vite · Jest

## Chạy dự án

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # Jest + React Testing Library, kèm coverage
npm run build    # type-check + build
```

## Cấu trúc (feature-based)

```
src/
├── app/
│   ├── store.ts                  # configureStore (+ redux-logger ở dev), RootState, AppDispatch
│   └── hooks.ts                  # useAppDispatch, useAppSelector (typed hooks)
├── hooks/
│   ├── useForm.ts                # custom hook generic useForm<T>
│   └── useDebounce.ts            # trì hoãn giá trị 300 ms cho ô tìm kiếm
├── theme/
│   ├── ThemeContext.ts           # Context riêng cho theme + useTheme()
│   ├── ThemeProvider.tsx         # state theme, value bọc useMemo
│   └── ThemeToggle.tsx
├── test/                         # setup Jest, store/fixture dùng chung cho test
└── features/
    ├── assignments/
    │   ├── types.ts              # kiểu dữ liệu, utility types, type guard
    │   ├── deadline.ts           # calcDaysLeft, isOverdue, logic lọc và tìm kiếm
    │   ├── assignmentApi.ts      # API giả lập (trễ 800ms)
    │   ├── assignmentsSlice.ts   # slice, createAsyncThunk, selectors
    │   ├── mockData.ts           # generateMockAssignments(n) cho stress test
    │   └── components/
    │       ├── AssignmentCard.tsx    # React.memo, ghép từ các phần con Compound
    │       ├── AssignmentList.tsx    # tìm kiếm, ghim lên đầu, ảo hoá khi ≥ 100 bài
    │       ├── AssignmentForm.tsx
    │       ├── FilterTabs.tsx
    │       └── StressTestButton.tsx  # "Tạo 10.000 bài tập mẫu"
    ├── pins/usePinStore.ts       # Zustand: pinnedIds, togglePin, isPinned
    └── stats/
        ├── calcStats.ts          # đếm đã xong, quá hạn, theo môn
        └── StatsPage.tsx         # tải lười bằng React.lazy
```

## Kỹ thuật đã áp dụng

| Nội dung | Vị trí |
|---|---|
| Generic | `useForm<T>` và `register<K extends keyof T>` ([useForm.ts](src/hooks/useForm.ts)); `delay<T>` ([assignmentApi.ts](src/features/assignments/assignmentApi.ts)) |
| Utility types | `Omit<Assignment, 'id' \| 'completed'>`, `Record<keyof NewAssignment, string>`, `Record<Priority, string>`, `Partial<Record<keyof T, string>>` |
| Type guard | `isPriority`, `isAssignment` ([types.ts](src/features/assignments/types.ts)): kiểm tra dữ liệu `unknown` từ API và giá trị radio độ ưu tiên |
| Custom hook nâng cao | `useForm<T>`: quản lý giá trị, validate, xoá lỗi khi gõ, đưa focus về ô lỗi đầu tiên, `register()` trả về props (kèm `aria-invalid`) cho input |
| Compound Component | `<AssignmentCard>` ghép từ các phần `Toggle`, `Title`, `Subject`, `Priority`, `Status`, `Deadline`, `Pin`, `Delete` dùng chung Context (Buổi 2: thẻ nhận props để bọc được `React.memo`) |
| Redux Toolkit | `createSlice` (có `prepare` sinh id), `createSelector` (lọc, đếm theo bộ lọc, gợi ý môn học), typed hooks `withTypes` |
| createAsyncThunk | `fetchAssignments`: xử lý pending / fulfilled / rejected, `rejectValue` có kiểu, `condition` để chỉ gọi 1 lần |

## Bài thực hành 02

Lịch sử git có 2 bước để đo trước/sau tối ưu:

| Commit | Nội dung |
|---|---|
| `TH B2 bước 1` | Đủ tính năng mới (ghim, theme, logger, tìm kiếm, nút 10.000 bài, Thống kê) nhưng **chưa tối ưu**: lọc lại mỗi phím gõ, handler tạo mới mỗi lần render, render toàn bộ danh sách, Thống kê import thẳng |
| `TH B2 bước 2` | Áp 4 kỹ thuật tối ưu bên dưới |

### Phần A — Quản lý state

| Yêu cầu | Cách làm |
|---|---|
| Ghim bài (Zustand) | [usePinStore.ts](src/features/pins/usePinStore.ts): `pinnedIds`, `togglePin(id)`, `isPinned(id)`. Nút ghim trong thẻ đọc `isPinned` qua selector nên chỉ thẻ đó render lại; `sortPinnedFirst` đưa bài ghim lên đầu. Không đưa vào Redux vì là state giao diện đơn giản |
| Theme sáng/tối | [ThemeContext.ts](src/theme/ThemeContext.ts) tách riêng; [ThemeProvider.tsx](src/theme/ThemeProvider.tsx) bọc `value` bằng `useMemo`, `toggleTheme` bằng `useCallback`. Cây `<App>` truyền qua `children` nên đổi theme chỉ re-render `ThemeToggle`; màu đổi bằng CSS variable theo `data-theme` |
| redux-logger | [store.ts](src/app/store.ts): `import.meta.env.DEV ? getDefaultMiddleware().concat(logger) : getDefaultMiddleware()` |

**Kiểm tra theme bằng Profiler:** `npm run dev` → React DevTools → Profiler → bật "Highlight updates when components render" → Record → bấm "Chế độ tối" → Stop. Kết quả mong đợi: commit chỉ có `ThemeProvider` và `ThemeToggle`; `App`, `AssignmentList`, `AssignmentCard`… nằm trong "Did not render".

**Ảnh console redux-logger:** `npm run dev` → mở Console → thêm một bài, đánh dấu hoàn thành, xoá → mỗi action in `prev state`, `action`, `next state` (`assignments/addAssignment`, `assignments/toggleAssignment`, `assignments/deleteAssignment`).

### Phần B — Tối ưu hiệu năng

| Kỹ thuật | Vị trí | Vì sao đúng chỗ |
|---|---|---|
| `React.memo` + `useCallback` | [AssignmentCard.tsx](src/features/assignments/components/AssignmentCard.tsx), `handleToggle`/`handleDelete` trong [AssignmentList.tsx](src/features/assignments/components/AssignmentList.tsx) | Thẻ là thành phần lặp nhiều nhất; Immer giữ tham chiếu các bài không đổi nên memo bỏ qua được gần hết thẻ |
| `useDebounce` 300 ms + `useMemo` | [useDebounce.ts](src/hooks/useDebounce.ts), `visible` trong AssignmentList | Lọc 10.000 bài mỗi phím gõ là phần tốn nhất khi tìm kiếm; giờ chỉ lọc khi ngừng gõ và khi dữ liệu/ghim đổi |
| Ảo hoá `react-window` (v2 `List`) | AssignmentList, từ 100 bài trở lên | Chỉ dựng DOM cho hàng nhìn thấy. Danh sách ngắn vẫn render thường để thẻ cao tự do (tên dài xuống dòng) |
| `React.lazy` + `Suspense` | [App.tsx](src/App.tsx) | Trang Thống kê không cần lúc mở app; build tách thành chunk `StatsPage-*.js` |

Không thêm `useMemo` cho `calcStats` trong StatsPage: trang chỉ render lại khi danh sách bài đổi, lúc đó vẫn phải tính lại.

**Cách đo** (làm trên cả 2 commit, cùng máy, cùng trình duyệt):

1. Số lần render của `AssignmentCard` khi gõ tìm kiếm: `npm run dev` → bấm "Tạo 10.000 bài tập mẫu" → Profiler → Record → gõ `bài` vào ô tìm kiếm → Stop → xem số commit và số lần `AssignmentCard` render (tab Ranked / chọn component → "Rendered at").
2. Điểm Performance: `npm run build && npm run preview` (bản production, không có logger) → Lighthouse → chế độ **Timespan** → Start → bấm "Tạo 10.000 bài tập mẫu" → gõ `bài` → End. Ghi điểm Performance, TBT, INP.

**Bảng so sánh** (các ô `[thiếu]` do người làm bài đo rồi điền; bundle chính tăng vì thêm react-window):

| Chỉ số | Trước (bước 1) | Sau (bước 2) |
|---|---|---|
| Số lần render `AssignmentCard` khi gõ `bài` (10.000 bài) | [thiếu: đo bằng Profiler] | [thiếu: đo bằng Profiler] |
| Số commit khi gõ `bài` | [thiếu] | [thiếu] |
| Thời gian commit lớn nhất (ms) | [thiếu] | [thiếu] |
| Lighthouse Performance (Timespan) | [thiếu] | [thiếu] |
| Total Blocking Time (ms) | [thiếu] | [thiếu] |
| Bundle JS chính (output `npm run build`) | 278.17 kB (gzip 88.58 kB) | 289.42 kB (gzip 92.60 kB) + chunk `StatsPage` 1.99 kB (gzip 0.84 kB) |

### Phần C — Kiểm thử

`npm test` chạy Jest + ts-jest + React Testing Library kèm coverage; [jest.config.ts](jest.config.ts) đặt `coverageThreshold` 70% statements, chỉ thu coverage trong `src/features/`.

| Loại | File | Nội dung |
|---|---|---|
| Unit | [deadline.test.ts](src/features/assignments/deadline.test.ts), [calcStats.test.ts](src/features/stats/calcStats.test.ts), [assignmentsSlice.test.ts](src/features/assignments/assignmentsSlice.test.ts), [usePinStore.test.ts](src/features/pins/usePinStore.test.ts) | `calcDaysLeft`, `isOverdue` (biên: hạn hôm nay), `calcStats` (biên: rỗng), reducer (biên: id không tồn tại, state undefined), ghim |
| Component | [AssignmentCard.test.tsx](src/features/assignments/components/AssignmentCard.test.tsx), [AssignmentForm.test.tsx](src/features/assignments/components/AssignmentForm.test.tsx), [StatsPage.test.tsx](src/features/stats/StatsPage.test.tsx) | Hiển thị, nút hoàn thành, nút ghim, xoá có xác nhận; form validate và submit |
| Bất đồng bộ | [AssignmentList.test.tsx](src/features/assignments/components/AssignmentList.test.tsx) | `jest.mock('../assignmentApi')`: đang tải, thành công, lỗi; tìm kiếm, ghim, ảo hoá 10.000 bài |
| Hook | [useDebounce.test.ts](src/hooks/useDebounce.test.ts) | `renderHook` + fake timers |

## Quy ước lọc

- **Chưa hoàn thành**: chưa xong, chưa quá hạn
- **Quá hạn**: chưa xong, hạn nộp đã qua
- **Đã hoàn thành**: đã đánh dấu xong

Ba nhóm này không trùng nhau. Hạn nộp tính theo ngày: hạn hôm nay hiển thị "Còn 0 ngày".
