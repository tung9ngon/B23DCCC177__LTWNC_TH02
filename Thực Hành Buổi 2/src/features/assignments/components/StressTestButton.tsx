import { useAppDispatch } from '../../../app/hooks';
import { addManyAssignments } from '../assignmentsSlice';
import { generateMockAssignments } from '../mockData';

const STRESS_COUNT = 10_000;

export function StressTestButton() {
  const dispatch = useAppDispatch();

  return (
    <div className="stress">
      <button
        type="button"
        className="btn-secondary"
        onClick={() => dispatch(addManyAssignments(generateMockAssignments(STRESS_COUNT)))}
      >
        Tạo {STRESS_COUNT.toLocaleString('vi-VN')} bài tập mẫu
      </button>
      <p className="stress__hint">Stress test: thêm dữ liệu ngẫu nhiên để đo hiệu năng danh sách.</p>
    </div>
  );
}
