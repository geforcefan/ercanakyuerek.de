import { readCar } from './car';
import { readIndividualColor } from './individual-color';
import {
  makeChunkReader,
  NoLimitsStream,
  readBoolean,
  readChunks,
  readNull,
  readString,
  readUnsignedInteger,
} from '../nolimits-stream';

export const readTrain = (stream: NoLimitsStream) => {
  const cars: ReturnType<typeof readCar>[] = [];

  const startBlock = readString(stream);

  // number of cars (ignored, cars are read via CAR chunks)
  readUnsignedInteger(stream);

  readNull(stream, 4);

  const runBackward = readBoolean(stream);
  const removedFromTrack = readBoolean(stream);

  readNull(stream, 31);

  let individualColor:
    | ReturnType<typeof readIndividualColor>
    | undefined;

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
