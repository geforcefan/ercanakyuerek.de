import {
  NoLimitsStream,
  readBoolean,
  readColor,
  readDouble,
  readNull,
  readUnsigned8,
  readUnsignedInteger,
  writeBoolean,
  writeColor,
  writeDouble,
  writeNull,
  writeUnsigned8,
  writeUnsignedInteger,
} from '../nolimits-stream';

export type StationSection = ReturnType<typeof readStationSection>;

export const readStationSection = (stream: NoLimitsStream) => {
  const useTransportDevice = readBoolean(stream);

  const transportTransportType = readUnsigned8(stream); // Transport::TransportType
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

  const passes = readUnsigned8(stream);
  const shuttleBackwardsStart = readBoolean(stream);
  const stationNumber = readUnsignedInteger(stream);

  readNull(stream, 3);

  const numSynchronizeDispatchWith = readUnsigned8(stream);
  const synchronizeDispatchWith: number[] = [];

  for (let i = 0; i < numSynchronizeDispatchWith; i++) {
    synchronizeDispatchWith.push(readUnsignedInteger(stream));
  }

  const extraBlockLength = readDouble(stream);

  const brakeType = readUnsigned8(stream); // Brake::BrakeType
  const gateDirection = readUnsigned8(stream); // Station::GateDirection
  const display = readUnsigned8(stream); // Station::Display
  const entranceStairs = readUnsigned8(stream); // Station::Stairs
  const exitStairs = readUnsigned8(stream); // Station::Stairs

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

export const writeStationSection = (
  stream: NoLimitsStream,
  station: StationSection,
): void => {
  writeBoolean(stream, station.useTransportDevice);

  writeUnsigned8(stream, station.transportDevice.transportType);
  writeDouble(stream, station.transportDevice.speed);
  writeDouble(stream, station.transportDevice.acceleration);
  writeDouble(stream, station.transportDevice.deceleration);

  writeDouble(stream, station.brakeDevice.deceleration);

  writeDouble(stream, station.waitTime.average);
  writeDouble(stream, station.waitTime.minimum);
  writeDouble(stream, station.waitTime.maximum);
  writeDouble(stream, station.waitTime.deviation);

  writeBoolean(stream, station.transportDevice.launch);
  writeDouble(stream, station.transportDevice.launchAcceleration);
  writeDouble(stream, station.transportDevice.launchMaxSpeed);

  writeBoolean(stream, station.unloadingOnly);

  writeNull(stream, 3);

  writeUnsigned8(stream, station.passes);
  writeBoolean(stream, station.shuttleBackwardsStart);
  writeUnsignedInteger(stream, station.stationNumber);

  writeNull(stream, 3);

  writeUnsigned8(
    stream,
    station.waitTime.synchronizeDispatchWith.length,
  );
  for (const id of station.waitTime.synchronizeDispatchWith) {
    writeUnsignedInteger(stream, id);
  }

  writeDouble(stream, station.extraBlockLength);

  writeUnsigned8(stream, station.brakeDevice.brakeType);
  writeUnsigned8(stream, station.gateDirection);
  writeUnsigned8(stream, station.display);
  writeUnsigned8(stream, station.entranceStairs);
  writeUnsigned8(stream, station.exitStairs);

  writeNull(stream, 1);

  writeColor(stream, station.gatesColor);
  writeColor(stream, station.railingsColor);
  writeColor(stream, station.structureColor);

  writeNull(stream, 142);
};
