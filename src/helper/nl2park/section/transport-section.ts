import {
  NoLimitsStream,
  readBoolean,
  readDouble,
  readNull,
  readUnsigned8,
  readUnsignedInteger,
  writeBoolean,
  writeDouble,
  writeNull,
  writeUnsigned8,
  writeUnsignedInteger,
} from '../nolimits-stream';

export type TransportSection = ReturnType<
  typeof readTransportSection
>;

export const readTransportSection = (stream: NoLimitsStream) => {
  const transportType = readUnsigned8(stream); // Transport::TransportType
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

export const writeTransportSection = (
  stream: NoLimitsStream,
  transport: TransportSection,
): void => {
  writeUnsigned8(stream, transport.transportType);
  writeDouble(stream, transport.speed);
  writeDouble(stream, transport.acceleration);
  writeDouble(stream, transport.deceleration);
  writeUnsignedInteger(stream, transport.speedingUpPasses);
  writeBoolean(stream, transport.speedingDown);
  writeDouble(stream, transport.minSpeed);

  writeNull(stream, 26);
};
