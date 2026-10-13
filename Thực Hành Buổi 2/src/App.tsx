import { useEffect, useState } from 'react';
import { useAppDispatch } from './app/hooks';
import { fetchAssignments } from './features/assignments/assignmentsSlice';
import { AssignmentForm } from './features/assignments/components/AssignmentForm';
import { AssignmentList } from './features/assignments/components/AssignmentList';
import { FilterTabs } from './features/assignments/components/FilterTabs';
import { StressTestButton } from './features/assignments/components/StressTestButton';
import { StatsPage } from './features/stats/StatsPage';
import { ThemeToggle } from './theme/ThemeToggle';

type View = 'list' | 'stats';

const VIEW_LABELS: Record<View, string> = {
  list: 'Danh sách',
  stats: 'Thống kê',
};

const today = new Date().toLocaleDateString('vi-VN', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export default function App() {
  const dispatch = useAppDispatch();
  const [view, setView] = useState<View>('list');

  useEffect(() => {
    dispatch(fetchAssignments());
  }, [dispatch]);

  return (
    <div className="app">
      <header className="masthead">
        <div>
          <h1>Student Deadline Tracker</h1>
          <p className="masthead__sub">Theo dõi hạn nộp bài tập của bạn</p>
        </div>
        <div className="masthead__side">
          <p className="masthead__today">
            Hôm nay
            <strong>{today}</strong>
          </p>
          <ThemeToggle />
        </div>
      </header>

      <nav className="segmented view-tabs" aria-label="Trang">
        {(Object.keys(VIEW_LABELS) as View[]).map((v) => (
          <button key={v} type="button" className="segmented__item" aria-pressed={view === v} onClick={() => setView(v)}>
            {VIEW_LABELS[v]}
          </button>
        ))}
      </nav>

      {view === 'stats' ? (
        <main>
          <StatsPage />
        </main>
      ) : (
        <main className="layout">
          <section className="panel panel--form" aria-labelledby="form-heading">
            <h2 id="form-heading">Thêm bài tập</h2>
            <AssignmentForm />
            <StressTestButton />
          </section>

          <section className="panel" aria-labelledby="list-heading">
            <div className="panel__head">
              <h2 id="list-heading">Bài tập</h2>
              <FilterTabs />
            </div>
            <AssignmentList />
          </section>
        </main>
      )}
    </div>
  );
}
