import {
  NoLimitsStream,
  readBoolean,
  readByte,
  readColor,
  readNull,
} from '../nolimits-stream';

export enum Tunnel {
  None = 0,
  Steel = 1,
  Wooden = 2,
  RoundConcrete = 3,
  RectangularConcrete = 4,
  Virtual = 5,
}

export enum TieSpacing {
  LowestStress = 0,
  LowerStress = 1,
  LowStress = 2,
  Normal = 3,
  HighStress = 4,
  HighestStress = 5,
}

export const readSegment = (stream: NoLimitsStream) => {
  const useMainSpineColor = readBoolean(stream);
  const railColor = readColor(stream);
  const crossTiesColor = readColor(stream);
  const mainSpineColor = readColor(stream);

  const tunnel = readByte(stream) as Tunnel;

  const leftRailingAndCatwalk = readBoolean(stream);
  const rightRailingAndCatwalk = readBoolean(stream);

  const spineType = readByte(stream);

  const spineColorScheme = readByte(stream);
  const invisibleSegment = readBoolean(stream);

  readNull(stream, 2);

  const woodenSupportFlag1 = readByte(stream);
  const woodenSupportFlag2 = readByte(stream);

  const handrailsColor = readColor(stream);
  const catwalksColor = readColor(stream);

  const transparentCatwalks = readBoolean(stream);
  const useRailsColor = readBoolean(stream);
  const useCrossTiesColor = readBoolean(stream);
  const useHandrailsColor = readBoolean(stream);
  const useCatwalksColor = readBoolean(stream);
  const useSpineColorScheme = readBoolean(stream);

  const leftRailingLights = readBoolean(stream);
  const leftRailingLightsColor = readColor(stream);

  const rightRailingLights = readBoolean(stream);
  const rightRailingLightsColor = readColor(stream);

  readNull(stream, 45);

  return {
    useMainSpineColor,
    railColor,
    crossTiesColor,
    mainSpineColor,
    tunnel,
    leftRailingAndCatwalk,
    rightRailingAndCatwalk,
    spineType,
    spineColorScheme,
    invisibleSegment,
    woodenSupport: {
      flag1: woodenSupportFlag1,
      flag2: woodenSupportFlag2,
    },
    handrailsColor,
    catwalksColor,
    transparentCatwalks,
    useRailsColor,
    useCrossTiesColor,
    useHandrailsColor,
    useCatwalksColor,
    useSpineColorScheme,
    leftRailingLights,
    leftRailingLightsColor,
    rightRailingLights,
    rightRailingLightsColor,
  };
};
