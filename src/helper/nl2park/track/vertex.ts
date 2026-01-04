import { NoLimitsStream, readBoolean, readDoubleVector4, readNull } from '../nolimits-stream';

export const readVertex = (stream: NoLimitsStream) => {
  const vertex = {
    position: readDoubleVector4(stream),
    locked: readBoolean(stream),
    strict: readBoolean(stream),
  };
  readNull(stream, 22);
  return vertex;
};
