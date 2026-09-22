import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectFilter, selectFilterCounts, setFilter } from '../assignmentsSlice';
import { FILTERS, FILTER_LABELS } from '../types';

export function FilterTabs() {
  const dispatch = useAppDispatch();
  const current = useAppSelector(selectFilter);
  const counts = useAppSelector(selectFilterCounts);

  return (
    <div className="segmented" role="group" aria-label="Lọc theo trạng thái">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          className="segmented__item"
          aria-pressed={filter === current}
          onClick={() => dispatch(setFilter(filter))}
        >
          {FILTER_LABELS[filter]}
          <span className={`segmented__count${filter === 'overdue' && counts.overdue > 0 ? ' is-alert' : ''}`}>
            {counts[filter]}
          </span>
        </button>
      ))}
    </div>
  );
}
