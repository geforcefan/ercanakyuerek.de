import {
  NoLimitsStream,
  readBoolean,
  readColor,
  readNull,
  readString,
  readUnsignedInteger,
} from '../nolimits-stream';

export const readIndividualColor = (stream: NoLimitsStream) => {
  const hasIndividualColor = readBoolean(stream);

  const carColor = readColor(stream);
  const seatColor = readColor(stream);
  const harnessColor = readColor(stream);
  const bogieColor = readColor(stream);
  const chassisColor = readColor(stream);

  readNull(stream, 16);

  const carTextures: string[] = [];

  const numberOfTextures = readUnsignedInteger(stream);
  for (let i = 0; i < numberOfTextures; i++) {
    readNull(stream, 4);
    carTextures.push(readString(stream));
    readNull(stream, 8);
  }

  return {
    hasIndividualColor,
    carColor,
    seatColor,
    harnessColor,
    bogieColor,
    chassisColor,
    carTextures,
  };
};
