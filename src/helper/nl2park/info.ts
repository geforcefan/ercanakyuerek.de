import {
  NoLimitsStream,
  readBoolean,
  readFloat,
  readFloatVector2,
  readFloatVector3,
  readIntegerVector2,
  readNull,
  readString,
  readUnsigned8,
  writeBoolean,
  writeFloat,
  writeFloatVector2,
  writeFloatVector3,
  writeIntegerVector2,
  writeNull,
  writeString,
  writeUnsigned8,
} from './nolimits-stream';

export enum RideView {
  ClosestCoasterFirstTrain = 0,
  ClosestCoasterClosestTrain = 1,
  FlyView = 2,
  WalkView = 3,
}

export type Info = ReturnType<typeof readInfo>;

export const readInfo = (stream: NoLimitsStream) => {
  const version = {
    major: readUnsigned8(stream),
    minor: readUnsigned8(stream),
    revision: readUnsigned8(stream),
    build: readUnsigned8(stream),
  };

  readNull(stream, 27);

  const weather = {
    overwriteDefaultWeather: readBoolean(stream),
    rainIntensity: readFloat(stream),
    snowIntensity: readFloat(stream),
    windIntensity: readFloat(stream),
    fogIntensity: readFloat(stream),
    cloudsIntensity: readFloat(stream),
    overcastIntensity: readFloat(stream),
    thunderIntensity: readFloat(stream),
  };

  readNull(stream, 6);

  const author = readString(stream);
  const description = readString(stream);
  const preview = readString(stream);
  const environment = readString(stream);

  readNull(stream, 10);

  const sky = {
    overrideDefaultDateTime: readBoolean(stream),
    currentDate: readIntegerVector2(stream),
    currentTime: readIntegerVector2(stream),
  };

  const initial = {
    initialPositionAndRotationEnabled: readBoolean(stream),
    initialPosition: readFloatVector3(stream),
    initialRotation: readFloatVector2(stream),
    initialView: readUnsigned8(stream) as RideView,
  };

  readNull(stream, 21);

  return {
    version,
    weather,
    sky,
    initial,

    author,
    description,
    preview,
    environment,
  };
};

export const writeInfo = (
  stream: NoLimitsStream,
  info: Info,
): void => {
  writeUnsigned8(stream, info.version.major);
  writeUnsigned8(stream, info.version.minor);
  writeUnsigned8(stream, info.version.revision);
  writeUnsigned8(stream, info.version.build);

  writeNull(stream, 27);

  writeBoolean(stream, info.weather.overwriteDefaultWeather);
  writeFloat(stream, info.weather.rainIntensity);
  writeFloat(stream, info.weather.snowIntensity);
  writeFloat(stream, info.weather.windIntensity);
  writeFloat(stream, info.weather.fogIntensity);
  writeFloat(stream, info.weather.cloudsIntensity);
  writeFloat(stream, info.weather.overcastIntensity);
  writeFloat(stream, info.weather.thunderIntensity);

  writeNull(stream, 6);

  writeString(stream, info.author);
  writeString(stream, info.description);
  writeString(stream, info.preview);
  writeString(stream, info.environment);

  writeNull(stream, 10);

  writeBoolean(stream, info.sky.overrideDefaultDateTime);
  writeIntegerVector2(stream, info.sky.currentDate);
  writeIntegerVector2(stream, info.sky.currentTime);

  writeBoolean(
    stream,
    info.initial.initialPositionAndRotationEnabled,
  );
  writeFloatVector3(stream, info.initial.initialPosition);
  writeFloatVector2(stream, info.initial.initialRotation);
  writeUnsigned8(stream, info.initial.initialView);

  writeNull(stream, 21);
};
