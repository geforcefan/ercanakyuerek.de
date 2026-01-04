import { readIndividualColor } from './individual-color';
import {
  makeChunkReader,
  NoLimitsStream,
  readChunks,
  readUnsignedInteger,
} from '../nolimits-stream';

export const readCar = (stream: NoLimitsStream) => {
  let individualColor:
    | ReturnType<typeof readIndividualColor>
    | undefined;

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
