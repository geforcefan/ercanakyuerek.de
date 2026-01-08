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

export function toArrayBuffer(stream: NoLimitsStream): ArrayBuffer {
  return stream.content.buffer.slice(
    stream.content.byteOffset,
    stream.content.byteOffset + stream.content.byteLength,
  );
}

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

export function readUnsigned8(stream: NoLimitsStream): number {
  const value = stream.content[stream.position];
  stream.position += 1;
  return value;
}

export function readBoolean(stream: NoLimitsStream): boolean {
  return !!readUnsigned8(stream);
}

export function readIntegerVector2(
  stream: NoLimitsStream,
): [number, number] {
  return [readInteger(stream), readInteger(stream)];
}

export function readUnsigned8Vector2(
  stream: NoLimitsStream,
): [number, number] {
  return [readUnsigned8(stream), readUnsigned8(stream)];
}

export function readUnsigned8Vector3(
  stream: NoLimitsStream,
): [number, number, number] {
  return [
    readUnsigned8(stream),
    readUnsigned8(stream),
    readUnsigned8(stream),
  ];
}

export function readFloatVector2(
  stream: NoLimitsStream,
): [number, number] {
  return [readFloat(stream), readFloat(stream)];
}

export function readFloatVector3(
  stream: NoLimitsStream,
): [number, number, number] {
  return [readFloat(stream), readFloat(stream), readFloat(stream)];
}

export function readDoubleVector2(
  stream: NoLimitsStream,
): [number, number] {
  return [readDouble(stream), readDouble(stream)];
}

export function readDoubleVector3(
  stream: NoLimitsStream,
): [number, number, number] {
  return [readDouble(stream), readDouble(stream), readDouble(stream)];
}

export function readDoubleVector4(
  stream: NoLimitsStream,
): [number, number, number, number] {
  return [
    readDouble(stream),
    readDouble(stream),
    readDouble(stream),
    readDouble(stream),
  ];
}

export function readColor(stream: NoLimitsStream) {
  return readUnsigned8Vector3(stream);
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

export function writeDouble(
  stream: NoLimitsStream,
  value: number,
): void {
  const buffer = new ArrayBuffer(8);
  const dv = new DataView(buffer);

  dv.setFloat64(0, value);
  write(stream, buffer);
}

export function writeFloat(
  stream: NoLimitsStream,
  value: number,
): void {
  const buffer = new ArrayBuffer(8);
  const dv = new DataView(buffer);

  dv.setFloat32(0, value);
  write(stream, buffer);
}

export function writeUnsignedInteger(
  stream: NoLimitsStream,
  value: number,
): void {
  const buffer = new ArrayBuffer(4);
  const dv = new DataView(buffer);

  dv.setUint32(0, value);
  write(stream, buffer);
}

export function writeInteger(
  stream: NoLimitsStream,
  value: number,
): void {
  const buffer = new ArrayBuffer(4);
  const dv = new DataView(buffer);

  dv.setInt32(0, value);
  write(stream, buffer);
}

export function writeBoolean(
  stream: NoLimitsStream,
  value: boolean,
): void {
  const buffer = new ArrayBuffer(1);
  const view = new Uint8Array(buffer);

  view[0] = value ? 1 : 0;
  write(stream, buffer);
}

export function write(
  stream: NoLimitsStream,
  buffer: ArrayBuffer,
): void {
  const bytes = new Uint8Array(buffer);

  const next = new Uint8Array(stream.content.length + bytes.length);
  next.set(stream.content, 0);
  next.set(bytes, stream.content.length);

  stream.content = next;
  stream.position += bytes.length;
}

export function writeDoubleVector4(
  stream: NoLimitsStream,
  value: [number, number, number, number],
): void {
  writeDouble(stream, value[0]);
  writeDouble(stream, value[1]);
  writeDouble(stream, value[2]);
  writeDouble(stream, value[3]);
}

export function writeIntegerVector2(
  stream: NoLimitsStream,
  value: [number, number],
): void {
  writeInteger(stream, value[0]);
  writeInteger(stream, value[1]);
}

export function writeFloatVector2(
  stream: NoLimitsStream,
  value: [number, number],
): void {
  writeFloat(stream, value[0]);
  writeFloat(stream, value[1]);
}

export function writeFloatVector3(
  stream: NoLimitsStream,
  value: [number, number, number],
): void {
  writeFloat(stream, value[0]);
  writeFloat(stream, value[1]);
  writeFloat(stream, value[2]);
}

export function writeDoubleVector3(
  stream: NoLimitsStream,
  value: [number, number, number],
): void {
  writeDouble(stream, value[0]);
  writeDouble(stream, value[1]);
  writeDouble(stream, value[2]);
}

export function writeDoubleVector2(
  stream: NoLimitsStream,
  value: [number, number],
): void {
  writeDouble(stream, value[0]);
  writeDouble(stream, value[1]);
}

export function writeNull(
  stream: NoLimitsStream,
  byteCount: number,
): void {
  write(stream, new ArrayBuffer(byteCount));
}

export function writeUnsigned8(
  stream: NoLimitsStream,
  value: number,
): void {
  const buffer = new ArrayBuffer(1);
  new Uint8Array(buffer)[0] = value & 0xff;
  write(stream, buffer);
}

export function writeString(
  stream: NoLimitsStream,
  value: string,
): void {
  for (let i = 0; i < value.length; i++) {
    writeNull(stream, 1);
    writeUnsigned8(stream, value.charCodeAt(i));
  }

  writeNull(stream, 2);
}

export function writeUnsigned8Vector3(
  stream: NoLimitsStream,
  value: [number, number, number],
) {
  writeUnsigned8(stream, value[0]);
  writeUnsigned8(stream, value[1]);
  writeUnsigned8(stream, value[2]);
}

export function writeColor(
  stream: NoLimitsStream,
  color: [number, number, number],
): void {
  writeUnsigned8Vector3(stream, color);
}

export function writeChunkName(
  stream: NoLimitsStream,
  name: string,
): void {
  for (let i = 0; i < 4; i++) {
    const charCode = name.charCodeAt(i) ?? 0;
    writeUnsigned8(stream, charCode);
  }
}

export function writeChunk(
  stream: NoLimitsStream,
  chunkName: string,
  handler: (stream: NoLimitsStream) => void,
) {
  const chunkStream = fromArrayBuffer(new ArrayBuffer(0));
  handler(chunkStream);

  if (!chunkStream.content.length) return;
  writeUnsignedInteger(stream, chunkStream.content.length);
  writeChunkName(stream, chunkName);
  write(stream, chunkStream.content);
}
