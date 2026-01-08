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

export type LiftSection = ReturnType<typeof readLiftSection>;

export const readLiftSection = (stream: NoLimitsStream) => {
  readNull(stream, 3);
  const liftType = readUnsigned8(stream);
  readNull(stream, 3);

  const motorLocation = readUnsigned8(stream);
  const speed = readDouble(stream);
  const acceleration = readDouble(stream);
  const deceleration = readDouble(stream);

  const hasAntiRollbackDevice = readBoolean(stream);
  const shuttleModeGentle2ndPassRelease = readBoolean(stream);
  const extraBlockLength = readDouble(stream);

  const diveCoasterDropReleaseMode = readBoolean(stream);

  readNull(stream, 29);

  return {
    liftType,
    motorLocation,
    speed,
    acceleration,
    deceleration,
    hasAntiRollbackDevice,
    shuttleModeGentle2ndPassRelease,
    extraBlockLength,
    diveCoasterDropReleaseMode,
  };
};

export const writeLiftSection = (
  stream: NoLimitsStream,
  lift: LiftSection,
): void => {
  writeNull(stream, 3);
  writeUnsigned8(stream, lift.liftType);
  writeNull(stream, 3);

  writeUnsigned8(stream, lift.motorLocation);
  writeDouble(stream, lift.speed);
  writeDouble(stream, lift.acceleration);
  writeDouble(stream, lift.deceleration);

  writeBoolean(stream, lift.hasAntiRollbackDevice);
  writeBoolean(stream, lift.shuttleModeGentle2ndPassRelease);
  writeDouble(stream, lift.extraBlockLength);

  writeBoolean(stream, lift.diveCoasterDropReleaseMode);

  writeNull(stream, 29);
};
