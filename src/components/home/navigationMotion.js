// External motion state has only two observable edges. Tokens keep overlapping
// gestures independent; no timer guesses when a visible pull has completed.
const tokens = new Set();
const listeners = new Set();

export const getNavigationMotionSnapshot = () => tokens.size > 0;

function notify(previous) {
  if (previous === getNavigationMotionSnapshot()) return;
  [...listeners].forEach(listener => {
    if (!listeners.has(listener)) return;
    try { listener(); } catch { /* A consumer failure cannot strand a gesture. */ }
  });
}

export function beginNavigationMotion() {
  const previous = getNavigationMotionSnapshot();
  const token = {};
  tokens.add(token);
  notify(previous);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    const wasActive = getNavigationMotionSnapshot();
    tokens.delete(token);
    notify(wasActive);
  };
}

export function subscribeNavigationMotion(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
