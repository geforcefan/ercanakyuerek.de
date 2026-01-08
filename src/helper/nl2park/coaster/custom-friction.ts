import {
  NoLimitsStream,
  readDouble,
  readNull,
  writeDouble,
  writeNull,
} from '../nolimits-stream';

export type CustomFriction = ReturnType<typeof readCustomFriction>;

export const readCustomFriction = (stream: NoLimitsStream) => {
  const constFrictionParameter = readDouble(stream);
  const airResistanceParameter = readDouble(stream);

  readNull(stream, 32);

  return {
    constFrictionParameter,
    airResistanceParameter,
  };
};

export const writeCustomFriction = (
  stream: NoLimitsStream,
  friction: CustomFriction,
): void => {
  writeDouble(stream, friction.constFrictionParameter);
  writeDouble(stream, friction.airResistanceParameter);

  writeNull(stream, 32);
};
