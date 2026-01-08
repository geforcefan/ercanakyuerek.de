import {
  NoLimitsStream,
  readBoolean,
  readColor,
  readNull,
  readString,
  readUnsignedInteger,
  writeBoolean,
  writeColor,
  writeNull,
  writeString,
  writeUnsignedInteger,
} from '../nolimits-stream';

export type IndividualColor = ReturnType<typeof readIndividualColor>;

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

export const writeIndividualColor = (
  stream: NoLimitsStream,
  color: IndividualColor,
): void => {
  writeBoolean(stream, color.hasIndividualColor);

  writeColor(stream, color.carColor);
  writeColor(stream, color.seatColor);
  writeColor(stream, color.harnessColor);
  writeColor(stream, color.bogieColor);
  writeColor(stream, color.chassisColor);

  writeNull(stream, 16);

  writeUnsignedInteger(stream, color.carTextures.length);
  for (const texture of color.carTextures) {
    writeNull(stream, 4);
    writeString(stream, texture);
    writeNull(stream, 8);
  }
};
