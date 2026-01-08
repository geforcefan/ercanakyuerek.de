import {
  makeChunkReader,
  NoLimitsStream,
  readChunks,
  readDouble,
  writeChunk,
  writeDouble,
} from '../nolimits-stream';
import {
  readSection,
  Section,
  writeSection,
} from '../section/section';
import { TrackPoint } from './custom-track';
import { readSegment, Segment, writeSegment } from './segment';

export type SeparatorPoint = ReturnType<typeof readSeparatorPoint>;

export const readSeparatorPoint = (stream: NoLimitsStream) => {
  const position = readDouble(stream);

  let segment: Segment | undefined;
  let section: Section | undefined;

  readChunks(
    [
      makeChunkReader(readSegment, 'SEGM', (s) => {
        segment = s;
      }),
      makeChunkReader(readSection, 'SECT', (s) => (section = s)),
    ],
    stream,
  );

  return {
    pointType: 'separator' as const,
    position,
    segment,
    section,
  };
};

export const writeSeparatorPoint = (
  stream: NoLimitsStream,
  separator: SeparatorPoint,
): void => {
  writeDouble(stream, separator.position);

  writeChunk(stream, 'SEGM', (s) => {
    if (!separator.segment) return;
    writeSegment(s, separator.segment);
  });

  writeChunk(stream, 'SECT', (s) => {
    if (!separator.section) return;
    writeSection(s, separator.section);
  });
};

export const isSeparatorPoint = (
  p: TrackPoint,
): p is SeparatorPoint => {
  return p.pointType === 'separator';
};
