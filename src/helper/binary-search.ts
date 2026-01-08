import { MathUtils } from 'three';

export const lowerBound = <T>(
  array: T[],
  value: number,
  accessor: (item: T, index: number) => number,
): number => {
  let first = 0;
  let len = array.length;

  while (len > 0) {
    const half = Math.floor(len / 2);
    const middle = first + half;

    if (accessor(array[middle], middle) < value) {
      first = middle + 1;
      len = len - half - 1;
    } else {
      len = half;
    }
  }

  return first;
};

export const findBoundingIndices = <T>(
  array: T[],
  value: number,
  accessor: (item: T, index: number) => number,
) => {
  if (array.length < 2) return;

  const lowerNodeIndex = lowerBound(array, value, accessor);
  const rightNodeIndex = MathUtils.clamp(
    lowerNodeIndex,
    1,
    array.length - 1,
  );
  const leftNodeIndex = rightNodeIndex - 1;

  return [leftNodeIndex, rightNodeIndex];
};
