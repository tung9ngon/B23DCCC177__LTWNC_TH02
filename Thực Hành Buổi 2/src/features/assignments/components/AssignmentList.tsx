import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
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
import type { FilterStatus } from '../types';
import { AssignmentCard } from './AssignmentCard';

const EMPTY_MESSAGES: Record<FilterStatus, string> = {
  all: 'Chưa có bài tập nào. Thêm bài đầu tiên ở mục "Thêm bài tập".',
  pending: 'Không còn bài nào đang chờ làm.',
  overdue: 'Không có bài nào quá hạn.',
  completed: 'Chưa có bài nào được đánh dấu hoàn thành.',
};

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

  const visible = sortPinnedFirst(
    assignments.filter((a) => matchesSearch(a, query)),
    pinnedIds,
  );

  const handleToggle = (id: string) => dispatch(toggleAssignment(id));
  const handleDelete = (id: string) => dispatch(deleteAssignment(id));

  let content;
  if (status === 'loading') content = <LoadingRows />;
  else if (status === 'failed') content = <p className="empty empty--error">{error}</p>;
  else if (visible.length === 0)
    content = <p className="empty">{query.trim() ? `Không có bài tập nào khớp "${query.trim()}".` : EMPTY_MESSAGES[filter]}</p>;
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
