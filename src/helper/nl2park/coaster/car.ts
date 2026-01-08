import {
  makeChunkReader,
  NoLimitsStream,
  readChunks,
  readUnsignedInteger,
  writeChunk,
  writeUnsignedInteger,
} from '../nolimits-stream';
import {
  IndividualColor,
  readIndividualColor,
  writeIndividualColor,
} from './individual-color';

export type Car = ReturnType<typeof readCar>;

export const readCar = (stream: NoLimitsStream) => {
  let individualColor: IndividualColor | undefined;

  const internalCarIndex = readUnsignedInteger(stream);

  readChunks(
    [
      makeChunkReader(
        readIndividualColor,
        'INDC',
        (color) => (individualColor = color),
      ),
    ],
    stream,
  );

  return {
    internalCarIndex,
    individualColor,
  };
};

export const writeCar = (stream: NoLimitsStream, car: Car): void => {
  writeUnsignedInteger(stream, car.internalCarIndex);
  writeChunk(stream, 'INDC', (s) => {
    if (!car.individualColor) return;
    writeIndividualColor(s, car.individualColor);
  });
};
