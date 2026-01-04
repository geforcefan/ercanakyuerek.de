import {
  NoLimitsStream,
  readDouble,
  readString,
  readNull,
  readByte,
} from '../nolimits-stream';

export enum TriggerTrainEvent {
  None = 0,
  UnlockSpinning = 1,
  LockSpinning = 2,
  UnlockSwinging = 3,
  LockSwinging = 4,
}

export const readTrigger = (stream: NoLimitsStream) => {
  const position = readDouble(stream);
  const name = readString(stream);

  readNull(stream, 3);

  const trainEvent = readByte(stream) as TriggerTrainEvent;

  readNull(stream, 26);

  return {
    pointType: 'trigger' as const,
    position,
    name,
    trainEvent,
  };
};
