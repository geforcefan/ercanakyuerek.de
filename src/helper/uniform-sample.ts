export const uniformSample = (
  from: number,
  to: number,
  resolution: number = 10,
  fn: (at: number, t: number, nodeIndex: number) => void,
) => {
  const length = to - from;
  const numberOfNodes = Math.max(Math.floor(length * resolution), 2);

  for (let i = 0; i < numberOfNodes; i++) {
    const t = i / (numberOfNodes - 1);
    const at = from + t * length;
    fn(at, t, i);
  }
};

export const uniformSampleMap = <T>(
  from: number,
  to: number,
  resolution: number = 10,
  mapFn: (at: number, t: number) => T,
) => {
  const out: T[] = [];

  uniformSample(from, to, resolution, (at, t) => {
    out.push(mapFn(at, t));
  });

  return out;
};
