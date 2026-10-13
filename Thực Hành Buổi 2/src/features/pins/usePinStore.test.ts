import { sortPinnedFirst, usePinStore } from './usePinStore';

beforeEach(() => usePinStore.setState({ pinnedIds: [] }));

describe('usePinStore', () => {
  it('togglePin ghim rồi bỏ ghim, isPinned phản ánh đúng', () => {
    const { togglePin, isPinned } = usePinStore.getState();
    togglePin('a');
    expect(isPinned('a')).toBe(true);
    expect(usePinStore.getState().pinnedIds).toEqual(['a']);
    togglePin('a');
    expect(isPinned('a')).toBe(false);
  });
});

describe('sortPinnedFirst', () => {
  const items = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];

  it('đưa bài đã ghim lên đầu, phần còn lại giữ thứ tự', () => {
    expect(sortPinnedFirst(items, ['3', '1']).map((i) => i.id)).toEqual(['1', '3', '2', '4']);
  });

  it('không ghim bài nào thì trả lại đúng mảng cũ', () => {
    expect(sortPinnedFirst(items, [])).toBe(items);
  });
});
