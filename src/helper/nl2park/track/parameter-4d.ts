import {
  NoLimitsStream,
  readDouble,
  readNull,
} from '../nolimits-stream';

export const readParameter4D = (stream: NoLimitsStream) => {
  const position = readDouble(stream);
  const angle = readDouble(stream);

  readNull(stream, 20);

  return {
    pointType: "parameter4D" as const,
    position,
    angle,
  };
};
