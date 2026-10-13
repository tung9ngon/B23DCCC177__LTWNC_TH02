import { toDateKey } from './deadline';
import { isAssignment, type Assignment } from './types';

const MOCK_DELAY_MS = 800;

/** Giả lập độ trễ mạng; generic để giữ nguyên kiểu của giá trị trả về */
function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** Hạn nộp tính từ hôm nay để dữ liệu mẫu lúc nào cũng có đủ trạng thái */
function dueIn(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

/** Giống JSON server trả về: chưa biết kiểu, phải kiểm tra trước khi dùng */
function buildMockResponse(): unknown {
  return [
    { id: 'seed-1', subject: 'Lập trình Web nâng cao', title: 'Bài thực hành Redux Toolkit', deadline: dueIn(3), priority: 'high', completed: false },
    { id: 'seed-2', subject: 'Cơ sở dữ liệu phân tán', title: 'Bài tập nhóm: thiết kế phân mảnh', deadline: dueIn(-2), priority: 'high', completed: false },
    { id: 'seed-3', subject: 'Trí tuệ nhân tạo', title: 'Cài đặt thuật toán A*', deadline: dueIn(0), priority: 'medium', completed: false },
    { id: 'seed-4', subject: 'Kiến trúc và thiết kế phần mềm', title: 'Báo cáo các mẫu thiết kế', deadline: dueIn(7), priority: 'medium', completed: false },
    { id: 'seed-5', subject: 'An toàn bảo mật hệ thống thông tin', title: 'Lab mã hoá RSA', deadline: dueIn(1), priority: 'high', completed: true },
    { id: 'seed-6', subject: 'Phát triển phần mềm hướng dịch vụ', title: 'Xây dựng REST API', deadline: dueIn(-5), priority: 'low', completed: true },
    { id: 'seed-7', subject: 'Trí tuệ nhân tạo', title: 'Quiz chương 3', deadline: dueIn(-1), priority: 'low', completed: false },
    { id: 'seed-8', subject: 'Tiếng Anh chuyên ngành', title: 'Essay: công nghệ và giáo dục', deadline: dueIn(12), priority: 'low', completed: false },
  ];
}

/** GET /assignments (giả lập) */
export async function fetchAssignmentsApi(): Promise<Assignment[]> {
  const data = await delay(buildMockResponse(), MOCK_DELAY_MS);
  if (!Array.isArray(data) || !data.every(isAssignment)) {
    throw new Error('Dữ liệu từ API không đúng định dạng');
  }
  return data;
}
