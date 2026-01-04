import {
  NoLimitsStream,
  readBoolean,
  readByte,
  readFloat,
  readFloatVector2,
  readFloatVector3,
  readIntegerVector2,
  readNull,
  readString,
} from './nolimits-stream';

export enum RideView {
  ClosestCoasterFirstTrain = 0,
  ClosestCoasterClosestTrain = 1,
  FlyView = 2,
  WalkView = 3,
}

export const readInfo = (stream: NoLimitsStream) => {
  const version = {
    major: readByte(stream),
    minor: readByte(stream),
    revision: readByte(stream),
    build: readByte(stream),
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
    initialView: readByte(stream) as RideView,
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
