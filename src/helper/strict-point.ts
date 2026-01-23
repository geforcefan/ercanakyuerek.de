export const splitPointsByStrict = <T extends { strict: boolean }>(
  points: Array<T>,
) => {
  const result: T[][] = [];
  const indices = points.reduce<Array<number>>(
    (indices, v, i) => {
      if ((v.strict && i) || i === points.length - 1) indices.push(i);
      return indices;
    },
    [0],
  );

  for (let i = 0; i < indices.length - 1; i += 1) {
    result.push(points.slice(indices[i], indices[i + 1] + 1));
  }

  return result;
};
