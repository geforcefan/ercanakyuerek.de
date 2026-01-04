import {
  makeChunkReader,
  NoLimitsStream,
  readChunks,
  readDouble,
} from '../nolimits-stream';
import { readSection } from '../section/section';
import { readSegment } from './segment';
import { TrackPoint } from './custom-track';

export const readSeparator = (stream: NoLimitsStream) => {
  const position = readDouble(stream);

  let segment: ReturnType<typeof readSegment> | undefined;
  let section: ReturnType<typeof readSection> | undefined;

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
    pointType: "separator" as const,
    position,
    segment,
    section,
  };
};

export const isSeparatorPoint = (p: TrackPoint): p is ReturnType<typeof readSeparator> => {
  return p.pointType === 'separator';
};
