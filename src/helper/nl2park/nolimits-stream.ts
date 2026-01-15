import { Vector2, Vector3, Vector4 } from 'three';

export type NoLimitsStream = {
  content: Uint8Array;
  position: number;
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

export const toArrayBuffer = (stream: NoLimitsStream) =>
  stream.content.buffer.slice(
    stream.content.byteOffset,
    stream.content.byteOffset + stream.content.byteLength,
  );

export const fromChunk = (stream: NoLimitsStream) => {
  const size = readInteger(stream);
  const start = stream.position;
  const end = start + size;
  const chunk = fromUint8Array(stream.content.slice(start, end));

  stream.position = end;
  return chunk;
};

export const readChunkName = (stream: NoLimitsStream) => {
  const start = stream.position;
  const slice = stream.content.slice(start, start + 4);

  stream.position += 4;
  return String.fromCharCode(...slice);
};

export const makeChunkReader = <Name extends string, T>(
  reader: (stream: NoLimitsStream) => T,
  chunkName: Name,
  handler: (result: T) => void,
) => ({
  reader: Object.assign(reader, { chunkName }),
  handler,
});

export const readChunks = (
  readers: readonly {
    reader: ((stream: NoLimitsStream) => any) & { chunkName: string };
    handler: (result: any) => void;
  }[],
  baseStream: NoLimitsStream,
) => {
  for (let i = 0; i <= baseStream.content.length; i++) {
    baseStream.position = i;

    const name = readChunkName(baseStream).trim();
    const reader = readers.find((e) => e.reader.chunkName === name);

    if (reader) {
      reader.handler(reader.reader(fromChunk(baseStream)));
      i = baseStream.position - 1;
    }
  }
};

export const readInteger = (stream: NoLimitsStream) => {
  const dv = new DataView(
    stream.content.buffer,
    stream.content.byteOffset + stream.position,
    4,
  );

  const value = dv.getInt32(0);
  stream.position += 4;
  return value;
};

export const readUnsignedInteger = (stream: NoLimitsStream) => {
  const dv = new DataView(
    stream.content.buffer,
    stream.content.byteOffset + stream.position,
    4,
  );

  const value = dv.getUint32(0);
  stream.position += 4;
  return value;
};

export const readFloat = (stream: NoLimitsStream) => {
  const dv = new DataView(
    stream.content.buffer,
    stream.content.byteOffset + stream.position,
    4,
  );

  const value = dv.getFloat32(0);
  stream.position += 4;
  return value;
};

export const readDouble = (stream: NoLimitsStream) => {
  const dv = new DataView(
    stream.content.buffer,
    stream.content.byteOffset + stream.position,
    8,
  );

  const value = dv.getFloat64(0);
  stream.position += 8;
  return value;
};

export const readUnsigned8 = (stream: NoLimitsStream) => {
  const value = stream.content[stream.position];
  stream.position += 1;
  return value;
};

export const readBoolean = (stream: NoLimitsStream) =>
  !!readUnsigned8(stream);

export const readIntegerVector2 = (stream: NoLimitsStream) =>
  new Vector2().fromArray([readInteger(stream), readInteger(stream)]);

export const readUnsigned8Vector2 = (stream: NoLimitsStream) =>
  new Vector2().fromArray([
    readUnsigned8(stream),
    readUnsigned8(stream),
  ]);

export const readUnsigned8Vector3 = (stream: NoLimitsStream) =>
  new Vector3().fromArray([
    readUnsigned8(stream),
    readUnsigned8(stream),
    readUnsigned8(stream),
  ]);

export const readFloatVector2 = (stream: NoLimitsStream) =>
  new Vector2().fromArray([readFloat(stream), readFloat(stream)]);

export const readFloatVector3 = (stream: NoLimitsStream) =>
  new Vector3().fromArray([
    readFloat(stream),
    readFloat(stream),
    readFloat(stream),
  ]);

export const readDoubleVector2 = (stream: NoLimitsStream) =>
  new Vector2().fromArray([readDouble(stream), readDouble(stream)]);

export const readDoubleVector3 = (stream: NoLimitsStream) =>
  new Vector3().fromArray([
    readDouble(stream),
    readDouble(stream),
    readDouble(stream),
  ]);

export const readDoubleVector4 = (stream: NoLimitsStream) =>
  new Vector4().fromArray([
    readDouble(stream),
    readDouble(stream),
    readDouble(stream),
    readDouble(stream),
  ]);

export const readColor = (stream: NoLimitsStream) =>
  readUnsigned8Vector3(stream);

export const readNull = (
  stream: NoLimitsStream,
  byteCount: number,
) => {
  stream.position += byteCount;
};

export const readString = (stream: NoLimitsStream) => {
  let result = '';

  while (true) {
    const charCode = stream.content[stream.position + 1];
    stream.position += 2;

    if (charCode === 0) break;
    result += String.fromCharCode(charCode);
  }

  return result;
};

export const writeDouble = (
  stream: NoLimitsStream,
  value: number,
) => {
  const buffer = new ArrayBuffer(8);
  new DataView(buffer).setFloat64(0, value);
  write(stream, buffer);
};

export const writeFloat = (stream: NoLimitsStream, value: number) => {
  const buffer = new ArrayBuffer(8);
  new DataView(buffer).setFloat32(0, value);
  write(stream, buffer);
};

export const writeUnsignedInteger = (
  stream: NoLimitsStream,
  value: number,
) => {
  const buffer = new ArrayBuffer(4);
  new DataView(buffer).setUint32(0, value);
  write(stream, buffer);
};

export const writeInteger = (
  stream: NoLimitsStream,
  value: number,
) => {
  const buffer = new ArrayBuffer(4);
  new DataView(buffer).setInt32(0, value);
  write(stream, buffer);
};

export const writeBoolean = (
  stream: NoLimitsStream,
  value: boolean,
) => {
  const buffer = new ArrayBuffer(1);
  new Uint8Array(buffer)[0] = value ? 1 : 0;
  write(stream, buffer);
};

export const write = (
  stream: NoLimitsStream,
  buffer: ArrayBuffer,
) => {
  const bytes = new Uint8Array(buffer);
  const next = new Uint8Array(stream.content.length + bytes.length);

  next.set(stream.content, 0);
  next.set(bytes, stream.content.length);

  stream.content = next;
  stream.position += bytes.length;
};

export const writeDoubleVector4 = (
  stream: NoLimitsStream,
  value: Vector4,
) => {
  writeDouble(stream, value.x);
  writeDouble(stream, value.y);
  writeDouble(stream, value.z);
  writeDouble(stream, value.w);
};

export const writeIntegerVector2 = (
  stream: NoLimitsStream,
  value: Vector2,
) => {
  writeInteger(stream, value.x);
  writeInteger(stream, value.y);
};

export const writeFloatVector2 = (
  stream: NoLimitsStream,
  value: Vector2,
) => {
  writeFloat(stream, value.x);
  writeFloat(stream, value.y);
};

export const writeFloatVector3 = (
  stream: NoLimitsStream,
  value: Vector3,
) => {
  writeFloat(stream, value.x);
  writeFloat(stream, value.y);
  writeFloat(stream, value.z);
};

export const writeDoubleVector3 = (
  stream: NoLimitsStream,
  value: Vector3,
) => {
  writeDouble(stream, value.x);
  writeDouble(stream, value.y);
  writeDouble(stream, value.z);
};

export const writeDoubleVector2 = (
  stream: NoLimitsStream,
  value: Vector2,
) => {
  writeDouble(stream, value.x);
  writeDouble(stream, value.y);
};

export const writeNull = (
  stream: NoLimitsStream,
  byteCount: number,
) => {
  write(stream, new ArrayBuffer(byteCount));
};

export const writeUnsigned8 = (
  stream: NoLimitsStream,
  value: number,
) => {
  const buffer = new ArrayBuffer(1);
  new Uint8Array(buffer)[0] = value & 0xff;
  write(stream, buffer);
};

export const writeString = (
  stream: NoLimitsStream,
  value: string,
) => {
  for (let i = 0; i < value.length; i++) {
    writeNull(stream, 1);
    writeUnsigned8(stream, value.charCodeAt(i));
  }

  writeNull(stream, 2);
};

export const writeUnsigned8Vector3 = (
  stream: NoLimitsStream,
  value: Vector3,
) => {
  writeUnsigned8(stream, value.x);
  writeUnsigned8(stream, value.y);
  writeUnsigned8(stream, value.z);
};

export const writeColor = (
  stream: NoLimitsStream,
  color: Vector3,
) => {
  writeUnsigned8Vector3(stream, color);
};

export const writeChunkName = (
  stream: NoLimitsStream,
  name: string,
) => {
  for (let i = 0; i < 4; i++) {
    writeUnsigned8(stream, name.charCodeAt(i) ?? 0);
  }
};

export const writeChunk = (
  stream: NoLimitsStream,
  chunkName: string,
  handler: (stream: NoLimitsStream) => void,
) => {
  const chunkStream = fromArrayBuffer(new ArrayBuffer(0));
  handler(chunkStream);

  if (!chunkStream.content.length) return;

  writeUnsignedInteger(stream, chunkStream.content.length);
  writeChunkName(stream, chunkName);
  write(stream, chunkStream.content);
};
