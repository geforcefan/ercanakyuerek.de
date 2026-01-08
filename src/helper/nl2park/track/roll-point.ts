import {
  NoLimitsStream,
  readBoolean,
  readDouble,
  writeBoolean,
  writeDouble,
} from '../nolimits-stream';
import { TrackPoint } from './custom-track';

export type RollPoint = ReturnType<typeof readRollPoint>;

export const readRollPoint = (stream: NoLimitsStream) => {
  return {
    pointType: 'roll' as const,
    position: readDouble(stream),
    roll: readDouble(stream),
    vertical: readBoolean(stream),
    strict: readBoolean(stream),
  };
};

export const writeRollPoint = (
  stream: NoLimitsStream,
  point: RollPoint,
): void => {
  writeDouble(stream, point.position);
  writeDouble(stream, point.roll);
  writeBoolean(stream, point.vertical);
  writeBoolean(stream, point.strict);
};

export const isRollPoint = (p: TrackPoint): p is RollPoint => {
  return p.pointType === 'roll';
};
