import { create } from 'zustand';

interface PinState {
  pinnedIds: string[];
  togglePin: (id: string) => void;
  isPinned: (id: string) => boolean;
}

/** Ghim là state giao diện đơn giản, không cần action/devtools như Redux nên để ở Zustand */
export const usePinStore = create<PinState>()((set, get) => ({
  pinnedIds: [],
  togglePin: (id) =>
    set((state) => ({
      pinnedIds: state.pinnedIds.includes(id)
        ? state.pinnedIds.filter((pinnedId) => pinnedId !== id)
        : [...state.pinnedIds, id],
    })),
  isPinned: (id) => get().pinnedIds.includes(id),
}));

/** Đưa bài đã ghim lên đầu, các bài còn lại giữ nguyên thứ tự */
export function sortPinnedFirst<T extends { id: string }>(items: T[], pinnedIds: string[]): T[] {
  if (pinnedIds.length === 0) return items;
  const pinned = new Set(pinnedIds);
  return [...items.filter((item) => pinned.has(item.id)), ...items.filter((item) => !pinned.has(item.id))];
}
