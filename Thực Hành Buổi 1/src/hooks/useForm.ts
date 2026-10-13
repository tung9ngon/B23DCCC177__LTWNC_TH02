import { useState, type ChangeEvent, type FormEvent } from 'react';

export type FormErrors<T> = Partial<Record<keyof T, string>>;

/**
 * Hook quản lý form dùng chung cho mọi kiểu giá trị T.
 * register(field) chỉ nhận khoá có thật trong T nên gõ sai tên trường sẽ lỗi lúc biên dịch.
 */
export function useForm<T extends Record<string, string>>(
  initialValues: T,
  validate: (values: T) => FormErrors<T>,
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});

  const register = <K extends keyof T>(field: K) => ({
    name: String(field),
    value: values[field],
    'aria-invalid': errors[field] ? true : undefined,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
  });

  const handleSubmit = (onValid: (values: T) => void) => (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      // Đưa con trỏ về ô lỗi đầu tiên, người dùng bàn phím / trình đọc màn hình biết ngay chỗ cần sửa
      const field = e.currentTarget.elements.namedItem(firstInvalid);
      if (field instanceof HTMLElement) field.focus();
      return;
    }

    onValid(values);
    setValues(initialValues);
  };

  return { values, errors, register, handleSubmit };
}
