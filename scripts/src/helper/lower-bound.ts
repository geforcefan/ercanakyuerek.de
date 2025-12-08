export const lowerBound = <T>(
  array: T[],
  value: number,
  accessor: (item: T) => number,
): number => {
  let first = 0;
  let len = array.length;

  while (len > 0) {
    const half = Math.floor(len / 2);
    const middle = first + half;

    if (accessor(array[middle]) < value) {
      first = middle + 1;
      len = len - half - 1;
    } else {
      len = half;
    }
  }

  return first;
};
