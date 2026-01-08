import {
  NoLimitsStream,
  readBoolean,
  readDoubleVector4,
  readNull,
  writeBoolean,
  writeDoubleVector4,
  writeNull,
} from '../nolimits-stream';

export type Vertex = ReturnType<typeof readVertex>;

export const readVertex = (stream: NoLimitsStream) => {
  const vertex = {
    position: readDoubleVector4(stream),
    locked: readBoolean(stream),
    strict: readBoolean(stream),
  };
  readNull(stream, 22);
  return vertex;
};

export const writeVertex = (
  stream: NoLimitsStream,
  vertex: Vertex,
): void => {
  writeDoubleVector4(stream, vertex.position);
  writeBoolean(stream, vertex.locked);
  writeBoolean(stream, vertex.strict);
  writeNull(stream, 22);
};
