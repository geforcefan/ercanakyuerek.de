export function lowerBound<T extends Record<K, number>, K extends keyof T>(
  a: T[],
  x: number,
  prop: K,
): number {
  let lo = 0;
  let hi = a.length;

  while (lo < hi) {
    const mid = (lo + hi) >> 1;

    if (a[mid][prop] < x) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  return lo;
}
