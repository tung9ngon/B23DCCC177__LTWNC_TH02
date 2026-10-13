import { useCallback, useMemo, useState } from 'react';
import { List, type RowComponentProps } from 'react-window';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { useDebounce } from '../../../hooks/useDebounce';
import { sortPinnedFirst, usePinStore } from '../../pins/usePinStore';
import {
  deleteAssignment,
  selectFilter,
  selectLoadError,
  selectLoadStatus,
  selectVisibleAssignments,
  toggleAssignment,
} from '../assignmentsSlice';
import { matchesSearch } from '../deadline';
import type { Assignment, FilterStatus } from '../types';
import { AssignmentCard } from './AssignmentCard';

const EMPTY_MESSAGES: Record<FilterStatus, string> = {
  all: 'Chưa có bài tập nào. Thêm bài đầu tiên ở mục "Thêm bài tập".',
  pending: 'Không còn bài nào đang chờ làm.',
  overdue: 'Không có bài nào quá hạn.',
  completed: 'Chưa có bài nào được đánh dấu hoàn thành.',
};

/** Từ ngưỡng này mới ảo hoá; danh sách ngắn render thường để giữ thẻ cao tự do (tên bài xuống dòng) */
const VIRTUALIZE_FROM = 100;
const ROW_HEIGHT = 72;
const LIST_HEIGHT = 640;

interface RowProps {
  items: Assignment[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function Row({ index, style, items, onToggle, onDelete }: RowComponentProps<RowProps>) {
  return <AssignmentCard assignment={items[index]} style={style} onToggle={onToggle} onDelete={onDelete} />;
}

function LoadingRows() {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">
        Đang tải danh sách bài tập…
      </p>
      <ul className="task-list" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="task task--skeleton">
            <span className="task__check">
              <span className="sk sk--box" />
            </span>
            <span className="task__main">
              <span className="sk sk--title" />
              <span className="sk sk--meta" />
            </span>
            <span className="task__due">
              <span className="sk sk--due" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AssignmentList() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectLoadStatus);
  const error = useAppSelector(selectLoadError);
  const filter = useAppSelector(selectFilter);
  const assignments = useAppSelector(selectVisibleAssignments);
  const pinnedIds = usePinStore((state) => state.pinnedIds);
  const [query, setQuery] = useState('');
  // Ô nhập vẫn cập nhật ngay; chỉ lọc lại khi ngừng gõ 300 ms
  const debouncedQuery = useDebounce(query, 300);

  const visible = useMemo(
    () =>
      sortPinnedFirst(
        assignments.filter((a) => matchesSearch(a, debouncedQuery)),
        pinnedIds,
      ),
    [assignments, debouncedQuery, pinnedIds],
  );

  // Giữ nguyên tham chiếu qua các lần render để React.memo của AssignmentCard có tác dụng
  const handleToggle = useCallback((id: string) => dispatch(toggleAssignment(id)), [dispatch]);
  const handleDelete = useCallback((id: string) => dispatch(deleteAssignment(id)), [dispatch]);

  let content;
  if (status === 'loading') content = <LoadingRows />;
  else if (status === 'failed') content = <p className="empty empty--error">{error}</p>;
  else if (visible.length === 0)
    content = (
      <p className="empty">
        {debouncedQuery.trim() ? `Không có bài tập nào khớp "${debouncedQuery.trim()}".` : EMPTY_MESSAGES[filter]}
      </p>
    );
  else if (visible.length >= VIRTUALIZE_FROM)
    // Chỉ render số hàng nhìn thấy (+ vài hàng dự phòng) thay vì cả 10.000 thẻ
    content = (
      <List
        tagName="ul"
        className="task-list task-list--virtual"
        style={{ height: LIST_HEIGHT }}
        rowComponent={Row}
        rowCount={visible.length}
        rowHeight={ROW_HEIGHT}
        rowProps={{ items: visible, onToggle: handleToggle, onDelete: handleDelete }}
        overscanCount={5}
      />
    );
  else
    content = (
      <ul className="task-list">
        {visible.map((assignment) => (
          <AssignmentCard key={assignment.id} assignment={assignment} onToggle={handleToggle} onDelete={handleDelete} />
        ))}
      </ul>
    );

  return (
    <>
      <div className="list-search">
        <label htmlFor="search" className="sr-only">
          Tìm bài tập
        </label>
        <input
          id="search"
          className="input"
          type="search"
          autoComplete="off"
          placeholder="Tìm theo tên bài hoặc môn học"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {content}
    </>
  );
}
