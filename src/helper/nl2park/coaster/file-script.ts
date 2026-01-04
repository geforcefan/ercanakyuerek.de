import {
  NoLimitsStream,
  readUnsignedInteger,
  readString,
  readNull,
} from '../nolimits-stream';

export const readFileScript = (stream: NoLimitsStream) => {
  const paths: string[] = [];

  const numberOfFileScripts = readUnsignedInteger(stream);
  for (let i = 0; i < numberOfFileScripts; i++) {
    paths.push(readString(stream));
    readNull(stream, 8);
  }

  readNull(stream, 8);

  return {
    paths,
  };
};
