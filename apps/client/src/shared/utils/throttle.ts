// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(func: T, delay: number = 100) {
  let lastRun = 0;
  let timeout: number | null = null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastRun >= delay) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      func.apply(this, args);
      lastRun = now;
    }
  };
}
