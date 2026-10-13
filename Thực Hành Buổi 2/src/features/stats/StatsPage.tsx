import { useAppSelector } from '../../app/hooks';
import { selectItems } from '../assignments/assignmentsSlice';
import { calcStats } from './calcStats';

const fmt = (n: number) => n.toLocaleString('vi-VN');

export function StatsPage() {
  const items = useAppSelector(selectItems);
  const stats = calcStats(items);

  const summary = [
    { label: 'Tổng số bài', value: stats.total, tone: '' },
    { label: 'Đã hoàn thành', value: stats.completed, tone: 'tone-success' },
    { label: 'Quá hạn', value: stats.overdue, tone: 'tone-danger' },
    { label: 'Chưa hoàn thành', value: stats.pending, tone: '' },
  ];

  return (
    <section className="panel" aria-labelledby="stats-heading">
      <div className="panel__head">
        <h2 id="stats-heading">Thống kê</h2>
      </div>

      <dl className="stats">
        {summary.map((s) => (
          <div key={s.label} className="stats__item">
            <dt>{s.label}</dt>
            <dd className={s.tone}>{fmt(s.value)}</dd>
          </div>
        ))}
      </dl>

      {stats.bySubject.length === 0 ? (
        <p className="empty">Chưa có bài tập nào để thống kê.</p>
      ) : (
        <table className="stats-table">
          <caption className="sr-only">Số bài theo môn học</caption>
          <thead>
            <tr>
              <th scope="col">Môn học</th>
              <th scope="col">Tổng</th>
              <th scope="col">Đã xong</th>
              <th scope="col">Quá hạn</th>
            </tr>
          </thead>
          <tbody>
            {stats.bySubject.map((row) => (
              <tr key={row.subject}>
                <th scope="row">{row.subject}</th>
                <td>{fmt(row.total)}</td>
                <td>{fmt(row.completed)}</td>
                <td className={row.overdue > 0 ? 'tone-danger' : undefined}>{fmt(row.overdue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
