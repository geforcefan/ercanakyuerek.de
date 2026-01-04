import {
  makeChunkReader,
  NoLimitsStream,
  readBoolean,
  readChunks,
  readDouble,
  readDoubleVector4,
  readInteger,
  readNull,
} from '../nolimits-stream';
import { readSection } from '../section/section';
import { readParameter4D } from './parameter-4d';
import { readRoll } from './roll';
import { readSegment } from './segment';
import { readSeparator } from './separator';
import { readTrigger } from './trigger';

export type TrackPoint =
  | ReturnType<typeof readRoll>
  | ReturnType<typeof readTrigger>
  | ReturnType<typeof readSeparator>
  | ReturnType<typeof readParameter4D>
  | { pointType: 'none'; position: number };

export const readCustomTrack = (stream: NoLimitsStream) => {
  const closed = readBoolean(stream);
  const firstRollPoint = {
    pointType: 'roll' as const,
    position: 0,
    roll: readDouble(stream),
    vertical: readBoolean(stream),
    strict: false,
  };

  const lastRollPoint = {
    pointType: 'roll' as const,
    position: 0,
    roll: readDouble(stream),
    vertical: readBoolean(stream),
    strict: false,
  };

  readNull(stream, 53);

  const numberOfControlPoints = readInteger(stream);
  lastRollPoint.position = numberOfControlPoints - 1;

  let points: Array<TrackPoint> = [];

  let segment: ReturnType<typeof readSegment> | undefined;
  let section: ReturnType<typeof readSection> | undefined;
  const vertices: Array<{
    position: number[];
    locked: boolean;
    strict: boolean;
  }> = [];

  for (let i = 0; i < numberOfControlPoints; i++) {
    vertices.push({
      position: readDoubleVector4(stream),
      locked: readBoolean(stream),
      strict: readBoolean(stream),
    });
    readNull(stream, 22);
  }

  readNull(stream, 60);

  readChunks(
    [
      makeChunkReader(readRoll, 'ROLL', (r) => points.push(r)),
      makeChunkReader(readTrigger, 'TTRG', (t) => points.push(t)),
      makeChunkReader(readSeparator, 'SEPA', (s) => points.push(s)),
      makeChunkReader(readParameter4D, '4DPM', (p) => points.push(p)),
      makeChunkReader(readSegment, 'SEGM', (s) => (segment = s)),
      makeChunkReader(readSection, 'SECT', (s) => (section = s)),
    ],
    stream,
  );

  points.unshift(firstRollPoint)
  points.push(lastRollPoint)

  return {
    closed,
    vertices,
    segment,
    section,
    points,
  };
};
