import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { useForm, type FormErrors } from '../../../hooks/useForm';
import { addAssignment, selectSubjects } from '../assignmentsSlice';
import { PRIORITIES, PRIORITY_LABELS, isPriority, type AssignmentFormValues } from '../types';

const initialValues: AssignmentFormValues = {
  subject: '',
  title: '',
  deadline: '',
  priority: 'medium',
};

function validate(values: AssignmentFormValues): FormErrors<AssignmentFormValues> {
  const errors: FormErrors<AssignmentFormValues> = {};
  if (!values.subject.trim()) errors.subject = 'Nhập tên môn học.';
  if (!values.title.trim()) errors.title = 'Nhập tên bài tập.';
  if (!values.deadline) errors.deadline = 'Chọn ngày hạn nộp.';
  return errors;
}

export function AssignmentForm() {
  const dispatch = useAppDispatch();
  const subjects = useAppSelector(selectSubjects);
  const { values, errors, register, handleSubmit } = useForm(initialValues, validate);
  const [lastAdded, setLastAdded] = useState('');
  const priority = register('priority');

  const onValid = (data: AssignmentFormValues) => {
    // Giá trị từ input là string; type guard thu hẹp về Priority trước khi đưa vào store
    if (!isPriority(data.priority)) return;
    const title = data.title.trim();
    dispatch(
      addAssignment({
        subject: data.subject.trim(),
        title,
        deadline: data.deadline,
        priority: data.priority,
      }),
    );
    setLastAdded(title);
  };

  return (
    <form className="add-form" onSubmit={handleSubmit(onValid)} noValidate>
      <div className="field">
        <label htmlFor="subject">
          Môn học <span className="req" aria-hidden="true">*</span>
        </label>
        <input
          id="subject"
          className="input"
          type="text"
          list="subject-options"
          autoComplete="off"
          placeholder="VD: Lập trình Web"
          required
          aria-describedby={errors.subject ? 'subject-error' : undefined}
          {...register('subject')}
        />
        <datalist id="subject-options">
          {subjects.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        {errors.subject && (
          <p id="subject-error" className="field__error">
            {errors.subject}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="title">
          Tên bài tập <span className="req" aria-hidden="true">*</span>
        </label>
        <input
          id="title"
          className="input"
          type="text"
          autoComplete="off"
          placeholder="VD: Bài thực hành 01"
          required
          aria-describedby={errors.title ? 'title-error' : undefined}
          {...register('title')}
        />
        {errors.title && (
          <p id="title-error" className="field__error">
            {errors.title}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="deadline">
          Hạn nộp <span className="req" aria-hidden="true">*</span>
        </label>
        <input
          id="deadline"
          className="input"
          type="date"
          required
          aria-describedby={errors.deadline ? 'deadline-error' : undefined}
          {...register('deadline')}
        />
        {errors.deadline && (
          <p id="deadline-error" className="field__error">
            {errors.deadline}
          </p>
        )}
      </div>

      <fieldset className="field">
        <legend>Độ ưu tiên</legend>
        <div className="choice">
          {PRIORITIES.map((p) => (
            <label key={p} className="choice__option">
              <input type="radio" name={priority.name} value={p} checked={values.priority === p} onChange={priority.onChange} />
              <span>{PRIORITY_LABELS[p]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button type="submit" className="btn-primary">
        Thêm bài tập
      </button>
      <p className="form-status" role="status">
        {lastAdded && `Đã thêm "${lastAdded}".`}
      </p>
    </form>
  );
}
