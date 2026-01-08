import {
  NoLimitsStream,
  readDouble,
  readNull,
  writeDouble,
  writeNull,
} from '../nolimits-stream';

export type Parameter4dPoint = ReturnType<
  typeof readParameter4DPoint
>;

export const readParameter4DPoint = (stream: NoLimitsStream) => {
  const position = readDouble(stream);
  const angle = readDouble(stream);

  readNull(stream, 20);

  return {
    pointType: 'parameter4D' as const,
    position,
    angle,
  };
};

export const writeParameter4DPoint = (
  stream: NoLimitsStream,
  parameter: Parameter4dPoint,
): void => {
  writeDouble(stream, parameter.position);
  writeDouble(stream, parameter.angle);

  writeNull(stream, 20);
};
