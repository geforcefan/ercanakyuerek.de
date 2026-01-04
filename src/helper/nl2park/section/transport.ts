import {
  NoLimitsStream,
  readByte,
  readDouble,
  readUnsignedInteger,
  readBoolean,
  readNull,
} from '../nolimits-stream';

export const readTransport = (stream: NoLimitsStream) => {
  const transportType = readByte(stream); // Transport::TransportType
  const speed = readDouble(stream);
  const acceleration = readDouble(stream);
  const deceleration = readDouble(stream);
  const speedingUpPasses = readUnsignedInteger(stream);
  const speedingDown = readBoolean(stream);
  const minSpeed = readDouble(stream);

  readNull(stream, 26);

  return {
    transportType,
    speed,
    acceleration,
    deceleration,
    speedingUpPasses,
    speedingDown,
    minSpeed,
  };
};
