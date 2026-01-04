import {
  NoLimitsStream,
  readByte,
  readDouble,
  readBoolean,
  readNull,
} from '../nolimits-stream';

export const readBrake = (stream: NoLimitsStream) => {
  const mode = readByte(stream); // Brake::BrakeMode
  const brakeType = readByte(stream); // Brake::BrakeType
  const deceleration = readDouble(stream);
  const speedLimit = readDouble(stream);
  const hysteresis = readDouble(stream);

  const positionOnTrain = readByte(stream); // Brake::Position
  const positionOnSection = readDouble(stream);

  const completeStop = readBoolean(stream);
  const waitTime = readDouble(stream);

  readNull(stream, 23);

  const enableTransport = readBoolean(stream);

  const transportType = readByte(stream); // Transport::TransportType
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
