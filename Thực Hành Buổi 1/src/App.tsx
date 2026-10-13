import { useEffect } from 'react';
import { useAppDispatch } from './app/hooks';
import { fetchAssignments } from './features/assignments/assignmentsSlice';
import { AssignmentForm } from './features/assignments/components/AssignmentForm';
import { AssignmentList } from './features/assignments/components/AssignmentList';
import { FilterTabs } from './features/assignments/components/FilterTabs';

const today = new Date().toLocaleDateString('vi-VN', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export default function App() {
  const dispatch = useAppDispatch();

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
        <p className="masthead__today">
          Hôm nay
          <strong>{today}</strong>
        </p>
      </header>

      <main className="layout">
        <section className="panel panel--form" aria-labelledby="form-heading">
          <h2 id="form-heading">Thêm bài tập</h2>
          <AssignmentForm />
        </section>

        <section className="panel" aria-labelledby="list-heading">
          <div className="panel__head">
            <h2 id="list-heading">Bài tập</h2>
            <FilterTabs />
          </div>
          <AssignmentList />
        </section>
      </main>
    </div>
  );
}
