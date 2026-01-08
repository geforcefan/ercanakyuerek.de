import {
  NoLimitsStream,
  readBoolean,
  readColor,
  readNull,
  readUnsigned8,
  writeBoolean,
  writeColor,
  writeNull,
  writeUnsigned8,
} from '../nolimits-stream';

export type StorageSection = ReturnType<typeof readStorageSection>;

export const readStorageSection = (stream: NoLimitsStream) => {
  const enableTransportDevice = readBoolean(stream);
  const transportType = readUnsigned8(stream); // Transport::TransportType
  const building = readUnsigned8(stream); // Storage::Building

  const roofColor = readColor(stream);
  const sideColor = readColor(stream);
  const frameColor = readColor(stream);

  readNull(stream, 20);

  return {
    enableTransportDevice,
    transportType,
    building,
    roofColor,
    sideColor,
    frameColor,
  };
};

export const writeStorageSection = (
  stream: NoLimitsStream,
  storage: StorageSection,
): void => {
  writeBoolean(stream, storage.enableTransportDevice);
  writeUnsigned8(stream, storage.transportType);
  writeUnsigned8(stream, storage.building);

  writeColor(stream, storage.roofColor);
  writeColor(stream, storage.sideColor);
  writeColor(stream, storage.frameColor);

  writeNull(stream, 20);
};
