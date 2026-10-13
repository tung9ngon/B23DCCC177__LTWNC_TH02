import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  deleteAssignment,
  selectFilter,
  selectLoadError,
  selectLoadStatus,
  selectVisibleAssignments,
  toggleAssignment,
} from '../assignmentsSlice';
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

  if (status === 'loading') return <LoadingRows />;
  if (status === 'failed') return <p className="empty empty--error">{error}</p>;
  if (assignments.length === 0) return <p className="empty">{EMPTY_MESSAGES[filter]}</p>;

  const handleToggle = (id: string) => dispatch(toggleAssignment(id));
  const handleDelete = (id: string) => dispatch(deleteAssignment(id));

  return (
    <ul className="task-list">
      {assignments.map((assignment) => (
        <AssignmentCard key={assignment.id} assignment={assignment}>
          <AssignmentCard.Toggle onToggle={handleToggle} />
          <div className="task__main">
            <AssignmentCard.Title />
            <p className="task__meta">
              <AssignmentCard.Subject />
              <AssignmentCard.Priority />
              <AssignmentCard.Status />
            </p>
          </div>
          <AssignmentCard.Deadline />
          <AssignmentCard.Delete onDelete={handleDelete} />
        </AssignmentCard>
      ))}
    </ul>
  );
}
