import {
  NoLimitsStream,
  readNull,
  readByte,
  readDouble,
  readBoolean,
} from '../nolimits-stream';

export const readLift = (stream: NoLimitsStream) => {
  readNull(stream, 3);

  const liftType = readByte(stream); // LiftType

  readNull(stream, 3);

  const motorLocation = readByte(stream); // MotorLocation
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
