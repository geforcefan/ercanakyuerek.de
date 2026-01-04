export type NoLimitsStream = {
  content: Uint8Array;
  position: number;
};

export type ChunkReader<Name extends string, T> = ((
  stream: NoLimitsStream,
) => T) & {
  chunkName: Name;
};

export const fromArrayBuffer = (
  content: ArrayBuffer,
  position: number = 0,
) => fromUint8Array(new Uint8Array(content), position);

export const fromUint8Array = (
  content: Uint8Array,
  position: number = 0,
) => ({
  content,
  position,
});

export function fromChunk(stream: NoLimitsStream): NoLimitsStream {
  const size = readInteger(stream);

  const start = stream.position;
  const end = start + size;
  const chunk = fromUint8Array(stream.content.slice(start, end));

  stream.position = end;
  return chunk;
}

export function readChunkName(stream: NoLimitsStream): string {
  const start = stream.position;
  const slice = stream.content.slice(start, start + 4);

  stream.position += 4;
  return String.fromCharCode(...slice);
}

export function makeChunkReader<Name extends string, T>(
  reader: (stream: NoLimitsStream) => T,
  chunkName: Name,
  handler: (result: T) => void,
) {
  return {
    reader: Object.assign(reader, { chunkName }),
    handler,
  };
}

export function readChunks<
  Readers extends readonly {
    reader: ((stream: NoLimitsStream) => any) & { chunkName: string };
    handler: (result: any) => void;
  }[],
>(readers: Readers, baseStream: NoLimitsStream) {
  for (let i = 0; i <= baseStream.content.length; i++) {
    baseStream.position = i;

    const name = readChunkName(baseStream).trim();

    const reader = readers.find((e) => e.reader.chunkName === name);
    if (reader) {
      reader.handler(reader.reader(fromChunk(baseStream)));
      i = baseStream.position - 1;
    }
  }
}

export function readInteger(stream: NoLimitsStream): number {
  const dv = new DataView(
    stream.content.buffer,
    stream.content.byteOffset + stream.position,
    4,
  );

  const value = dv.getInt32(0);
  stream.position += 4;
  return value;
}

export function readUnsignedInteger(stream: NoLimitsStream): number {
  const dv = new DataView(
    stream.content.buffer,
    stream.content.byteOffset + stream.position,
    4,
  );

  const value = dv.getUint32(0);
  stream.position += 4;
  return value;
}

export function readFloat(stream: NoLimitsStream): number {
  const dv = new DataView(
    stream.content.buffer,
    stream.content.byteOffset + stream.position,
    4,
  );

  const value = dv.getFloat32(0);
  stream.position += 4;
  return value;
}

export function readDouble(stream: NoLimitsStream): number {
  const dv = new DataView(
    stream.content.buffer,
    stream.content.byteOffset + stream.position,
    8,
  );

  const value = dv.getFloat64(0);
  stream.position += 8;
  return value;
}

export function readByte(stream: NoLimitsStream): number {
  const value = stream.content[stream.position];
  stream.position += 1;
  return value;
}

export function readBoolean(stream: NoLimitsStream): boolean {
  return !!readByte(stream);
}

export function readIntegerVector2(stream: NoLimitsStream) {
  return [readInteger(stream), readInteger(stream)];
}

export function readByteVector2(stream: NoLimitsStream) {
  return [readByte(stream), readByte(stream)];
}

export function readByteVector3(stream: NoLimitsStream) {
  return [readByte(stream), readByte(stream), readByte(stream)];
}

export function readFloatVector2(stream: NoLimitsStream) {
  return [readFloat(stream), readFloat(stream)];
}

export function readFloatVector3(stream: NoLimitsStream) {
  return [readFloat(stream), readFloat(stream), readFloat(stream)];
}

export function readDoubleVector2(stream: NoLimitsStream) {
  return [readDouble(stream), readDouble(stream)];
}

export function readDoubleVector3(stream: NoLimitsStream) {
  return [readDouble(stream), readDouble(stream), readDouble(stream)];
}

export function readDoubleVector4(stream: NoLimitsStream) {
  return [
    readDouble(stream),
    readDouble(stream),
    readDouble(stream),
    readDouble(stream),
  ];
}

export function readColor(stream: NoLimitsStream) {
  return readByteVector3(stream);
}

export function readNull(
  stream: NoLimitsStream,
  byteCount: number,
): void {
  stream.position += byteCount;
}

export function readString(stream: NoLimitsStream): string {
  let result = '';

  while (true) {
    const charCode = stream.content[stream.position + 1];
    stream.position += 2;

    if (charCode === 0) break;
    result += String.fromCharCode(charCode);
  }

  return result;
}
