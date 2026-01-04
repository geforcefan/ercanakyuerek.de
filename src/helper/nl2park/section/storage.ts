import {
  NoLimitsStream,
  readBoolean,
  readByte,
  readColor,
  readNull,
} from '../nolimits-stream';

export const readStorage = (stream: NoLimitsStream) => {
  const enableTransportDevice = readBoolean(stream);
  const transportType = readByte(stream); // Transport::TransportType
  const building = readByte(stream); // Storage::Building

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
