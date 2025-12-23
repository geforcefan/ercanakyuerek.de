export const uniformMap = <T>(
  from: number,
  to: number,
  resolution: number = 10,
  mapFn: (at: number) => T,
) => {
  const out: T[] = [];
  const length = to - from;
  const numberOfNodes = Math.max(Math.floor(length * resolution), 2);

  for (let i = 0; i < numberOfNodes; i++) {
    const at = from + (i / (numberOfNodes - 1)) * length;
    out.push(mapFn(at));
  }

  return out;
};
