import { readBrake } from './brake';
import { readLift } from './lift';
import {
  makeChunkReader,
  NoLimitsStream,
  readChunks,
  readNull,
  readString,
  readUnsignedInteger,
} from '../nolimits-stream';
import { readStation } from './station';
import { readStorage } from './storage';
import { readTransport } from './transport';

export const readSection = (stream: NoLimitsStream) => {
  readUnsignedInteger(stream); // section type
  const name = readString(stream);

  readNull(stream, 26);

  let section:
    | ({
        sectionType: 'lift';
      } & ReturnType<typeof readLift>)
    | ({
        sectionType: 'transport';
      } & ReturnType<typeof readTransport>)
    | ({
        sectionType: 'brake';
      } & ReturnType<typeof readBrake>)
    | ({
        sectionType: 'station';
      } & ReturnType<typeof readStation>)
    | ({
        sectionType: 'storage';
      } & ReturnType<typeof readStorage>)
    | {
        sectionType: 'none';
      } = { sectionType: 'none' };

  readChunks(
    [
      makeChunkReader(readLift, 'LIFT', (lift) => {
        section = {
          sectionType: 'lift',
          ...lift,
        };
      }),
      makeChunkReader(readTransport, 'TRNS', (transport) => {
        section = {
          sectionType: 'transport',
          ...transport,
        };
      }),
      makeChunkReader(readBrake, 'BRKE', (brake) => {
        section = {
          sectionType: 'brake',
          ...brake,
        };
      }),
      makeChunkReader(readStation, 'STTN', (station) => {
        section = {
          sectionType: 'station',
          ...station,
        };
      }),
      makeChunkReader(readStorage, 'STOR', (storage) => {
        section = {
          sectionType: 'storage',
          ...storage,
        };
      }),
    ],
    stream,
  );

  return {
    name,
    ...section,
  };
};
