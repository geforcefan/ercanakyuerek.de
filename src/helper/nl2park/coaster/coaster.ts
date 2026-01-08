import { compact } from 'lodash';

import {
  makeChunkReader,
  NoLimitsStream,
  readBoolean,
  readChunks,
  readColor,
  readDoubleVector2,
  readNull,
  readString,
  readUnsigned8,
  writeBoolean,
  writeChunk,
  writeColor,
  writeDoubleVector2,
  writeNull,
  writeString,
  writeUnsigned8,
} from '../nolimits-stream';
import {
  CustomTrack,
  readCustomTrack,
  writeCustomTrack,
} from '../track/custom-track';
import {
  CustomFriction,
  readCustomFriction,
  writeCustomFriction,
} from './custom-friction';
import { readFileScript, writeFileScript } from './file-script';
import { readScript, Script, writeScript } from './script';
import { readTrain, Train, writeTrain } from './train';

export type Coaster = ReturnType<typeof readCoaster>;

export const readCoaster = (stream: NoLimitsStream) => {
  const name = readString(stream);

  const colorsWireframeTrack = readColor(stream);

  const modeSplinePosition = readUnsigned8(stream);
  const modeSplinePositionOffset = readDoubleVector2(stream);

  const description = readString(stream);

  readNull(stream, 3);

  const styleStyleType = readUnsigned8(stream);

  const colorsRails = readColor(stream);
  const colorsCrossTies = readColor(stream);
  const colorsMainSpine = readColor(stream);
  const colorsCar = readColor(stream);
  const colorsSeat = readColor(stream);
  const colorsHarness = readColor(stream);
  const colorsBogie = readColor(stream);

  const frozen = readBoolean(stream);

  const colorsSpineColorScheme = readUnsigned8(stream);
  const colorsSupports = readColor(stream);
  const colorsTunnel = readColor(stream);

  const styleWornType = readUnsigned8(stream);
  const colorsChassis = readColor(stream);

  const modeOperationMode = readUnsigned8(stream);
  const styleRailType = readUnsigned8(stream);

  const colorsHandrails = readColor(stream);
  const colorsCatwalks = readColor(stream);

  const modePhysicsModel = readUnsigned8(stream);
  const hideWireframe = readBoolean(stream);

  readNull(stream, 1);

  const tracks: CustomTrack[] = [];
  const trains: Train[] = [];
  const scripts: Array<
    | ({
        scriptType: 'script';
      } & Script)
    | {
        scriptType: 'file-script';
        path: string;
      }
  > = [];
  let customFriction: CustomFriction | undefined;

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

export const writeCoaster = (
  stream: NoLimitsStream,
  coaster: Coaster,
): void => {
  writeString(stream, coaster.name);

  writeColor(stream, coaster.colors.wireframeTrack);

  writeUnsigned8(stream, coaster.mode.splinePosition);
  writeDoubleVector2(stream, coaster.mode.splinePositionOffset);

  writeString(stream, coaster.description);

  writeNull(stream, 3);

  writeUnsigned8(stream, coaster.style.styleType);

  writeColor(stream, coaster.colors.rails);
  writeColor(stream, coaster.colors.crossTies);
  writeColor(stream, coaster.colors.mainSpine);
  writeColor(stream, coaster.colors.car);
  writeColor(stream, coaster.colors.seat);
  writeColor(stream, coaster.colors.harness);
  writeColor(stream, coaster.colors.bogie);

  writeBoolean(stream, coaster.frozen);

  writeUnsigned8(stream, coaster.colors.spineColorScheme);
  writeColor(stream, coaster.colors.supports);
  writeColor(stream, coaster.colors.tunnel);

  writeUnsigned8(stream, coaster.style.wornType);
  writeColor(stream, coaster.colors.chassis);

  writeUnsigned8(stream, coaster.mode.operationMode);
  writeUnsigned8(stream, coaster.style.railType);

  writeColor(stream, coaster.colors.handrails);
  writeColor(stream, coaster.colors.catwalks);

  writeUnsigned8(stream, coaster.mode.physicsModel);
  writeBoolean(stream, coaster.hideWireframe);

  writeNull(stream, 1);

  // chunks
  for (const track of coaster.tracks) {
    writeChunk(stream, 'CUTK', (s) => writeCustomTrack(s, track));
  }

  for (const train of coaster.trains) {
    writeChunk(stream, 'TRAI', (s) => writeTrain(s, train));
  }

  writeChunk(stream, 'CUFR', (s) => {
    if (!coaster.customFriction) return;
    writeCustomFriction(s, coaster.customFriction);
  });

  coaster.scripts
    .filter((s) => s.scriptType === 'script')
    .forEach((script) =>
      writeChunk(stream, 'SCRT', (s) =>
        writeScript(s, script as Script),
      ),
    );

  const fileScripts = compact(
    coaster.scripts.map((s) =>
      s.scriptType === 'file-script' ? s.path : undefined,
    ),
  );

  if (fileScripts.length)
    writeChunk(stream, 'FSCR', (s) => {
      writeFileScript(s, {
        paths: fileScripts,
      });
    });
};
