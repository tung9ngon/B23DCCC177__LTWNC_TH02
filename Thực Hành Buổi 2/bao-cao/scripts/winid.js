// Dùng: osascript -l JavaScript winid.js <pid>  → in ra id cửa sổ lớn nhất của tiến trình
ObjC.import('CoreGraphics');
// osascript tự gọi run(argv) khi chạy file JXA
// eslint-disable-next-line no-unused-vars
function run(argv) {
  const pid = Number(argv[0]);
  const list = ObjC.deepUnwrap(ObjC.castRefToObject($.CGWindowListCopyWindowInfo($.kCGWindowListOptionAll, 0)));
  const wins = list.filter((w) => w.kCGWindowOwnerPID === pid && w.kCGWindowLayer === 0 && w.kCGWindowBounds.Height > 300);
  wins.sort((a, b) => b.kCGWindowBounds.Width * b.kCGWindowBounds.Height - a.kCGWindowBounds.Width * a.kCGWindowBounds.Height);
  return wins.length ? String(wins[0].kCGWindowNumber) : '';
}
