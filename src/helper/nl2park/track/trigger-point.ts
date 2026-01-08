import {
  NoLimitsStream,
  readDouble,
  readNull,
  readString,
  readUnsigned8,
  writeDouble,
  writeNull,
  writeString,
  writeUnsigned8,
} from '../nolimits-stream';

export enum TriggerTrainEvent {
  None = 0,
  UnlockSpinning = 1,
  LockSpinning = 2,
  UnlockSwinging = 3,
  LockSwinging = 4,
}

export type TriggerPoint = ReturnType<typeof readTriggerPoint>;

export const readTriggerPoint = (stream: NoLimitsStream) => {
  const position = readDouble(stream);
  const name = readString(stream);

  readNull(stream, 3);

  const trainEvent = readUnsigned8(stream) as TriggerTrainEvent;

  readNull(stream, 26);

  return {
    pointType: 'trigger' as const,
    position,
    name,
    trainEvent,
  };
};

export const writeTriggerPoint = (
  stream: NoLimitsStream,
  trigger: TriggerPoint,
): void => {
  writeDouble(stream, trigger.position);
  writeString(stream, trigger.name);
  writeNull(stream, 3);
  writeUnsigned8(stream, trigger.trainEvent);
  writeNull(stream, 26);
};
