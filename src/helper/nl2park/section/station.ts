import {
  NoLimitsStream,
  readBoolean,
  readByte,
  readColor,
  readDouble,
  readNull,
  readUnsignedInteger,
} from '../nolimits-stream';

export const readStation = (stream: NoLimitsStream) => {
  const useTransportDevice = readBoolean(stream);

  const transportTransportType = readByte(stream); // Transport::TransportType
  const transportSpeed = readDouble(stream);
  const transportAcceleration = readDouble(stream);
  const transportDeceleration = readDouble(stream);

  const brakeDeceleration = readDouble(stream);

  const waitTimeAverage = readDouble(stream);
  const waitTimeMinimum = readDouble(stream);
  const waitTimeMaximum = readDouble(stream);
  const waitTimeDeviation = readDouble(stream);

  const transportLaunch = readBoolean(stream);
  const transportLaunchAcceleration = readDouble(stream);
  const transportLaunchMaxSpeed = readDouble(stream);

  const unloadingOnly = readBoolean(stream);

  readNull(stream, 3);

  const passes = readByte(stream);
  const shuttleBackwardsStart = readBoolean(stream);
  const stationNumber = readUnsignedInteger(stream);

  readNull(stream, 3);

  const numSynchronizeDispatchWith = readByte(stream);
  const synchronizeDispatchWith: number[] = [];

  for (let i = 0; i < numSynchronizeDispatchWith; i++) {
    synchronizeDispatchWith.push(readUnsignedInteger(stream));
  }

  const extraBlockLength = readDouble(stream);

  const brakeType = readByte(stream); // Brake::BrakeType
  const gateDirection = readByte(stream); // Station::GateDirection
  const display = readByte(stream); // Station::Display
  const entranceStairs = readByte(stream); // Station::Stairs
  const exitStairs = readByte(stream); // Station::Stairs

  readNull(stream, 1);

  const gatesColor = readColor(stream);
  const railingsColor = readColor(stream);
  const structureColor = readColor(stream);

  readNull(stream, 142);

  return {
    useTransportDevice,
    transportDevice: {
      transportType: transportTransportType,
      speed: transportSpeed,
      acceleration: transportAcceleration,
      deceleration: transportDeceleration,
      launch: transportLaunch,
      launchAcceleration: transportLaunchAcceleration,
      launchMaxSpeed: transportLaunchMaxSpeed,
    },
    brakeDevice: {
      deceleration: brakeDeceleration,
      brakeType,
    },
    waitTime: {
      average: waitTimeAverage,
      minimum: waitTimeMinimum,
      maximum: waitTimeMaximum,
      deviation: waitTimeDeviation,
      synchronizeDispatchWith,
    },
    unloadingOnly,
    passes,
    shuttleBackwardsStart,
    stationNumber,
    extraBlockLength,
    gateDirection,
    display,
    entranceStairs,
    exitStairs,
    gatesColor,
    railingsColor,
    structureColor,
  };
};
