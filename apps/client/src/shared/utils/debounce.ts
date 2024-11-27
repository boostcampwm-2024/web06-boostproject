// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number) {
  let timeout: number | null = null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = window.setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
