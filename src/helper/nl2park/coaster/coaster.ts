import {
  makeChunkReader,
  NoLimitsStream,
  readBoolean,
  readByte,
  readChunks,
  readColor,
  readDoubleVector2,
  readNull,
  readString,
} from '../nolimits-stream';
import { readCustomTrack } from '../track/custom-track';
import { readCustomFriction } from './custom-friction';
import { readFileScript } from './file-script';
import { readScript } from './script';
import { readTrain } from './train';

export const readCoaster = (stream: NoLimitsStream) => {
  const name = readString(stream);

  const colorsWireframeTrack = readColor(stream);

  const modeSplinePosition = readByte(stream);
  const modeSplinePositionOffset = readDoubleVector2(stream);

  const description = readString(stream);

  readNull(stream, 3);

  const styleStyleType = readByte(stream);

  const colorsRails = readColor(stream);
  const colorsCrossTies = readColor(stream);
  const colorsMainSpine = readColor(stream);
  const colorsCar = readColor(stream);
  const colorsSeat = readColor(stream);
  const colorsHarness = readColor(stream);
  const colorsBogie = readColor(stream);

  const frozen = readBoolean(stream);

  const colorsSpineColorScheme = readByte(stream);
  const colorsSupports = readColor(stream);
  const colorsTunnel = readColor(stream);

  const styleWornType = readByte(stream);
  const colorsChassis = readColor(stream);

  const modeOperationMode = readByte(stream);
  const styleRailType = readByte(stream);

  const colorsHandrails = readColor(stream);
  const colorsCatwalks = readColor(stream);

  const modePhysicsModel = readByte(stream);
  const hideWireframe = readBoolean(stream);

  readNull(stream, 1);

  const tracks: ReturnType<typeof readCustomTrack>[] = [];
  const trains: ReturnType<typeof readTrain>[] = [];
  const scripts: Array<
    | ({
        scriptType: 'script';
      } & ReturnType<typeof readScript>)
    | {
        scriptType: 'file-script';
        path: string;
      }
  > = [];
  let customFriction:
    | ReturnType<typeof readCustomFriction>
    | undefined;

  readChunks(
    [
      makeChunkReader(readCustomTrack, 'CUTK', (customTrack) =>
        tracks.push(customTrack),
      ),
      makeChunkReader(readTrain, 'TRAI', (train) =>
        trains.push(train),
      ),
      makeChunkReader(
        readCustomFriction,
        'CUFR',
        (chunkCustomFriction) =>
          (customFriction = chunkCustomFriction),
      ),
      makeChunkReader(readScript, 'SCRT', (script) =>
        scripts.push({
          scriptType: 'script',
          ...script,
        }),
      ),
      makeChunkReader(readFileScript, 'FSCR', (fileScripts) =>
        fileScripts.paths.forEach((path) =>
          scripts.push({
            scriptType: 'file-script',
            path,
          }),
        ),
      ),
    ],
    stream,
  );

  return {
    name,
    description,
    hideWireframe,
    frozen,
    tracks,
    trains,
    scripts,
    customFriction,
    mode: {
      splinePosition: modeSplinePosition,
      splinePositionOffset: modeSplinePositionOffset,
      operationMode: modeOperationMode,
      physicsModel: modePhysicsModel,
    },
    style: {
      styleType: styleStyleType,
      wornType: styleWornType,
      railType: styleRailType,
    },
    colors: {
      wireframeTrack: colorsWireframeTrack,
      rails: colorsRails,
      crossTies: colorsCrossTies,
      mainSpine: colorsMainSpine,
      car: colorsCar,
      seat: colorsSeat,
      harness: colorsHarness,
      bogie: colorsBogie,
      spineColorScheme: colorsSpineColorScheme,
      supports: colorsSupports,
      tunnel: colorsTunnel,
      chassis: colorsChassis,
      handrails: colorsHandrails,
      catwalks: colorsCatwalks,
    },
  };
};
