import glue from './glue.wasm';

const module = await WebAssembly.compileStreaming(fetch(glue));

const instance = await WebAssembly.instantiate(module, {
  wasi_snapshot_preview1: {
    environ_get: () => {},
    environ_sizes_get: () => {},
    fd_close: () => {},
    fd_fdstat_get: () => {},
    fd_read: () => {},
    fd_write: () => {},
    proc_exit: () => {},
    fd_seek: () => {},
    fd_fdstat_set_flags: () => {},
    fd_prestat_get: () => {},
    fd_prestat_dir_name: () => {},
    path_open: () => {},
  },
});

export const bezierTotalArcLength = (bezierPointer: number) => {
  const { bezierTotalArcLength: func } = instance.exports as any;
  return func(bezierPointer);
};

export const bezierPositionAtArcLength = (
  bezierPointer: number,
  at: number,
) => {
  const { bezierPositionAtArcLength: func, memory } =
    instance.exports as any;
  const positionPointer = func(bezierPointer, at);
  return new Float32Array(memory.buffer, positionPointer, 3);
};

export const bezierFromPoints = (
  p0: number[],
  p1: number[],
  p2: number[],
  p3: number[],
) => {
  const {
    bezierFromPoints: func,
    malloc,
    memory,
  } = instance.exports as any;

  const pointers = [p0, p1, p2, p3].map((point) => {
    const pointer = malloc(3 * 4); // (x, y, z) * 4 bytes
    new Float32Array(memory.buffer, pointer, 3).set(point);
    return pointer;
  });

  return func(pointers[0], pointers[1], pointers[2], pointers[3]);
};
