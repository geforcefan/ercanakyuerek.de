import {
  makeChunkReader,
  NoLimitsStream,
  readBoolean,
  readChunks,
  readNull,
  readString,
  readUnsignedInteger,
  writeBoolean,
  writeChunk,
  writeNull,
  writeString,
  writeUnsignedInteger,
} from '../nolimits-stream';
import { readCar, writeCar } from './car';
import {
  IndividualColor,
  readIndividualColor,
  writeIndividualColor,
} from './individual-color';

export type Train = ReturnType<typeof readTrain>;

export const readTrain = (stream: NoLimitsStream) => {
  const cars: ReturnType<typeof readCar>[] = [];

  let individualColor: IndividualColor | undefined;
  const startBlock = readString(stream);

  readUnsignedInteger(stream); // number of cars (ignored, cars are read via CAR chunks)
  readNull(stream, 4);

  const runBackward = readBoolean(stream);
  const removedFromTrack = readBoolean(stream);

  readNull(stream, 31);

  readChunks(
    [
      makeChunkReader(readCar, 'CAR', (car) => cars.push(car)),
      makeChunkReader(
        readIndividualColor,
        'INDC',
        (color) => (individualColor = color),
      ),
    ],
    stream,
  );

  return {
    startBlock,
    runBackward,
    removedFromTrack,
    cars,
    individualColor,
  };
};

export const writeTrain = (
  stream: NoLimitsStream,
  train: Train,
): void => {
  writeString(stream, train.startBlock);

  writeUnsignedInteger(stream, train.cars.length);

  writeNull(stream, 4);

  writeBoolean(stream, train.runBackward);
  writeBoolean(stream, train.removedFromTrack);

  writeNull(stream, 31);

  for (const car of train.cars) {
    writeChunk(stream, 'CAR', (s) => writeCar(s, car));
  }

  writeChunk(stream, 'INDC', (s) => {
    if (!train.individualColor) return;
    writeIndividualColor(s, train.individualColor);
  });
};
