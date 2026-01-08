import {
  NoLimitsStream,
  readBoolean,
  readColor,
  readNull,
  readUnsigned8,
  writeBoolean,
  writeColor,
  writeNull,
  writeUnsigned8,
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

export type Segment = ReturnType<typeof readSegment>;

export const readSegment = (stream: NoLimitsStream) => {
  const useMainSpineColor = readBoolean(stream);
  const railColor = readColor(stream);
  const crossTiesColor = readColor(stream);
  const mainSpineColor = readColor(stream);

  const tunnel = readUnsigned8(stream) as Tunnel;

  const leftRailingAndCatwalk = readBoolean(stream);
  const rightRailingAndCatwalk = readBoolean(stream);

  const spineType = readUnsigned8(stream);
  const spineColorScheme = readUnsigned8(stream);
  const invisibleSegment = readBoolean(stream);

  readNull(stream, 2);

  const woodenSupportFlag1 = readUnsigned8(stream);
  const woodenSupportFlag2 = readUnsigned8(stream);

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

export const writeSegment = (
  stream: NoLimitsStream,
  segment: Segment,
): void => {
  writeBoolean(stream, segment.useMainSpineColor);
  writeColor(stream, segment.railColor);
  writeColor(stream, segment.crossTiesColor);
  writeColor(stream, segment.mainSpineColor);

  writeUnsigned8(stream, segment.tunnel);

  writeBoolean(stream, segment.leftRailingAndCatwalk);
  writeBoolean(stream, segment.rightRailingAndCatwalk);

  writeUnsigned8(stream, segment.spineType);
  writeUnsigned8(stream, segment.spineColorScheme);
  writeBoolean(stream, segment.invisibleSegment);

  writeNull(stream, 2);

  writeUnsigned8(stream, segment.woodenSupport.flag1);
  writeUnsigned8(stream, segment.woodenSupport.flag2);

  writeColor(stream, segment.handrailsColor);
  writeColor(stream, segment.catwalksColor);

  writeBoolean(stream, segment.transparentCatwalks);
  writeBoolean(stream, segment.useRailsColor);
  writeBoolean(stream, segment.useCrossTiesColor);
  writeBoolean(stream, segment.useHandrailsColor);
  writeBoolean(stream, segment.useCatwalksColor);
  writeBoolean(stream, segment.useSpineColorScheme);

  writeBoolean(stream, segment.leftRailingLights);
  writeColor(stream, segment.leftRailingLightsColor);

  writeBoolean(stream, segment.rightRailingLights);
  writeColor(stream, segment.rightRailingLightsColor);

  writeNull(stream, 45);
};
