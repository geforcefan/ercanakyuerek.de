import {
  NoLimitsStream,
  readDouble,
  readNull,
} from '../nolimits-stream';

export const readCustomFriction = (stream: NoLimitsStream) => {
  const constFrictionParameter = readDouble(stream);
  const airResistanceParameter = readDouble(stream);

  readNull(stream, 32);

  return {
    constFrictionParameter,
    airResistanceParameter,
  };
};
