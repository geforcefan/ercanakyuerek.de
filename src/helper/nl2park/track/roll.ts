import {
  NoLimitsStream,
  readBoolean,
  readDouble,
} from '../nolimits-stream';
import { TrackPoint } from './custom-track';

export const readRoll = (stream: NoLimitsStream) => {
  return {
    pointType: 'roll' as const,
    position: readDouble(stream),
    roll: readDouble(stream),
    vertical: readBoolean(stream),
    strict: readBoolean(stream),
  };
};

export const isRollPoint = (p: TrackPoint): p is ReturnType<typeof readRoll> => {
  return p.pointType === 'roll';
};
