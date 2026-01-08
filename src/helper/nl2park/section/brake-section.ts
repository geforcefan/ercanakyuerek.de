import {
  NoLimitsStream,
  readBoolean,
  readDouble,
  readNull,
  readUnsigned8,
  writeBoolean,
  writeDouble,
  writeNull,
  writeUnsigned8,
} from '../nolimits-stream';

export type BrakeSection = ReturnType<typeof readBrakeSection>;

export const readBrakeSection = (stream: NoLimitsStream) => {
  const mode = readUnsigned8(stream); // Brake::BrakeMode
  const brakeType = readUnsigned8(stream); // Brake::BrakeType
  const deceleration = readDouble(stream);
  const speedLimit = readDouble(stream);
  const hysteresis = readDouble(stream);

  const positionOnTrain = readUnsigned8(stream); // Brake::Position
  const positionOnSection = readDouble(stream);

  const completeStop = readBoolean(stream);
  const waitTime = readDouble(stream);

  readNull(stream, 23);

  const enableTransport = readBoolean(stream);

  const transportType = readUnsigned8(stream); // Transport::TransportType
  const transportSpeed = readDouble(stream);
  const transportAcceleration = readDouble(stream);
  const transportDeceleration = readDouble(stream);
  const transportLaunch = readBoolean(stream);
  const transportLaunchAcceleration = readDouble(stream);
  const transportLaunchMaxSpeed = readDouble(stream);

  const extraBlockLength = readDouble(stream);

  readNull(stream, 75);

  const transportDevice = {
    transportType,
    speed: transportSpeed,
    acceleration: transportAcceleration,
    deceleration: transportDeceleration,
    launch: transportLaunch,
    launchAcceleration: transportLaunchAcceleration,
    launchMaxSpeed: transportLaunchMaxSpeed,
  };

  return {
    mode,
    brakeType,
    deceleration,
    speedLimit,
    hysteresis,
    positionOnTrain,
    positionOnSection,
    completeStop,
    waitTime,
    enableTransport,
    transportDevice,
    extraBlockLength,
  };
};

export const writeBrakeSection = (
  stream: NoLimitsStream,
  brake: BrakeSection,
): void => {
  writeUnsigned8(stream, brake.mode);
  writeUnsigned8(stream, brake.brakeType);
  writeDouble(stream, brake.deceleration);
  writeDouble(stream, brake.speedLimit);
  writeDouble(stream, brake.hysteresis);

  writeUnsigned8(stream, brake.positionOnTrain);
  writeDouble(stream, brake.positionOnSection);

  writeBoolean(stream, brake.completeStop);
  writeDouble(stream, brake.waitTime);

  writeNull(stream, 23);

  writeBoolean(stream, brake.enableTransport);

  writeUnsigned8(stream, brake.transportDevice.transportType);
  writeDouble(stream, brake.transportDevice.speed);
  writeDouble(stream, brake.transportDevice.acceleration);
  writeDouble(stream, brake.transportDevice.deceleration);
  writeBoolean(stream, brake.transportDevice.launch);
  writeDouble(stream, brake.transportDevice.launchAcceleration);
  writeDouble(stream, brake.transportDevice.launchMaxSpeed);

  writeDouble(stream, brake.extraBlockLength);

  writeNull(stream, 75);
};
