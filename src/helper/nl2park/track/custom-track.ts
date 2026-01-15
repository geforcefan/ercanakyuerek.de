import { sortBy } from 'lodash';

import {
  makeChunkReader,
  NoLimitsStream,
  readBoolean,
  readChunks,
  readDouble,
  readDoubleVector4,
  readInteger,
  readNull,
  writeBoolean,
  writeChunk,
  writeDouble,
  writeDoubleVector4,
  writeNull,
  writeUnsignedInteger,
} from '../nolimits-stream';
import {
  readSection,
  Section,
  writeSection,
} from '../section/section';
import {
  Parameter4dPoint,
  readParameter4DPoint,
  writeParameter4DPoint,
} from './parameter-4d-point';
import {
  readRollPoint,
  RollPoint,
  writeRollPoint,
} from './roll-point';
import { readSegment, Segment, writeSegment } from './segment';
import {
  readSeparatorPoint,
  writeSeparatorPoint,
} from './separator-point';
import {
  readTriggerPoint,
  TriggerPoint,
  writeTriggerPoint,
} from './trigger-point';
import { Vertex } from './vertex';

export type TrackPoint =
  | RollPoint
  | TriggerPoint
  | ReturnType<typeof readSeparatorPoint>
  | Parameter4dPoint
  | { pointType: 'none'; position: number };

export type CustomTrack = ReturnType<typeof readCustomTrack>;

export const readCustomTrack = (stream: NoLimitsStream) => {
  const closed = readBoolean(stream);
  const startRoll = {
    roll: readDouble(stream),
    vertical: readBoolean(stream),
  };
  const endRoll = {
    roll: readDouble(stream),
    vertical: readBoolean(stream),
  };

  readNull(stream, 53);

  const numberOfControlPoints = readInteger(stream);

  let points: Array<TrackPoint> = [];

  let segment: Segment | undefined;
  let section: Section | undefined;
  const vertices: Array<Vertex> = [];

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
      makeChunkReader(readRollPoint, 'ROLL', (r) => points.push(r)),
      makeChunkReader(readTriggerPoint, 'TTRG', (t) =>
        points.push(t),
      ),
      makeChunkReader(readSeparatorPoint, 'SEPA', (s) =>
        points.push(s),
      ),
      makeChunkReader(readParameter4DPoint, '4DPM', (p) =>
        points.push(p),
      ),
      makeChunkReader(readSegment, 'SEGM', (s) => (segment = s)),
      makeChunkReader(readSection, 'SECT', (s) => (section = s)),
    ],
    stream,
  );

  return {
    closed,
    vertices,
    segment,
    section,
    points,
    startRoll,
    endRoll,
  };
};

export const writeCustomTrack = (
  stream: NoLimitsStream,
  track: CustomTrack,
): void => {
  writeBoolean(stream, track.closed);

  writeDouble(stream, track.startRoll.roll);
  writeBoolean(stream, track.startRoll.vertical);

  writeDouble(stream, track.endRoll.roll);
  writeBoolean(stream, track.endRoll.vertical);

  writeNull(stream, 53);

  writeUnsignedInteger(stream, track.vertices.length);

  for (const v of track.vertices) {
    writeDoubleVector4(stream, v.position);
    writeBoolean(stream, v.locked);
    writeBoolean(stream, v.strict);
    writeNull(stream, 22);
  }

  writeNull(stream, 60);

  for (const p of sortBy(track.points, 'pointType')) {
    switch (p.pointType) {
      case 'roll':
        writeChunk(stream, 'ROLL', (s) => writeRollPoint(s, p));
        break;

      case 'trigger':
        writeChunk(stream, 'TTRG', (s) => writeTriggerPoint(s, p));
        break;

      case 'separator':
        writeChunk(stream, 'SEPA', (s) => writeSeparatorPoint(s, p));
        break;

      case 'parameter4D':
        writeChunk(stream, '4DPM', (s) =>
          writeParameter4DPoint(s, p),
        );
        break;
    }
  }

  writeChunk(stream, 'SEGM', (s) => {
    if (!track.segment) return;
    writeSegment(s, track.segment);
  });

  writeChunk(stream, 'SECT', (s) => {
    if (!track.section) return;
    writeSection(s, track.section);
  });
};
