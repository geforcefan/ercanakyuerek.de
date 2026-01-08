import {
  Coaster,
  readCoaster,
  writeCoaster,
} from './coaster/coaster';
import { Info, readInfo, writeInfo } from './info';
import {
  makeChunkReader,
  NoLimitsStream,
  fromArrayBuffer as noLimitsStreamFromArrayBuffer,
  toArrayBuffer as noLimitsStreamToArrayBuffer,
  readChunks,
  writeChunk,
} from './nolimits-stream';

export type NoLimitsPark = ReturnType<typeof readPark>;

export const fromURL = async (url: string) => {
  const content = await fetch(url);
  return fromArrayBuffer(await content.arrayBuffer());
};

export const fromArrayBuffer = (content: ArrayBuffer) => {
  return readPark(noLimitsStreamFromArrayBuffer(content));
};

export const toArrayBuffer = (park: NoLimitsPark) => {
  const stream = noLimitsStreamFromArrayBuffer(new ArrayBuffer(0));
  writePark(stream, park);
  return noLimitsStreamToArrayBuffer(stream);
};

export const readPark = (stream: NoLimitsStream) => {
  const coaster: Coaster[] = [];
  let info: Info | undefined;

  readChunks(
    [
      makeChunkReader(readInfo, 'INFO', (i) => {
        info = i;
      }),
      makeChunkReader(readCoaster, 'COAS', (c) => {
        coaster.push(c);
      }),
    ],
    stream,
  );

  return {
    info,
    coaster,
  };
};

export const writePark = (
  stream: NoLimitsStream,
  park: NoLimitsPark,
) => {
  writeChunk(stream, 'INFO', (s) => {
    if (!park.info) return;
    writeInfo(s, park.info);
  });

  for (const c of park.coaster) {
    writeChunk(stream, 'COAS', (s) => writeCoaster(s, c));
  }
};
