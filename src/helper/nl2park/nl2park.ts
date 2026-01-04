import { readCoaster } from './coaster/coaster';
import { readInfo } from './info';
import {
  fromChunk,
  fromArrayBuffer as noLimitsStreamFromArrayBuffer,
  readChunkName,
} from './nolimits-stream';

export const fromURL = async (url: string) => {
  const content = await fetch(url);
  return fromArrayBuffer(await content.arrayBuffer());
};

export const fromArrayBuffer = (content: ArrayBuffer) => {
  const stream = noLimitsStreamFromArrayBuffer(content);

  const coaster: ReturnType<typeof readCoaster>[] = [];
  let info: ReturnType<typeof readInfo> | undefined;

  for (let i = 0; i <= stream.content.length; i++) {
    stream.position = i;

    const chunk = readChunkName(stream);

    if (chunk === 'INFO') {
      info = readInfo(fromChunk(stream));
      i = stream.position - 1;
    }

    if (chunk === 'COAS') {
      const coasterStream = fromChunk(stream);
      coaster.push(readCoaster(coasterStream));
      i = stream.position - 1;
    }
  }

  return {
    info,
    coaster,
  };
};
