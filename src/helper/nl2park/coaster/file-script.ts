import {
  NoLimitsStream,
  readNull,
  readString,
  readUnsignedInteger,
  writeNull,
  writeString,
  writeUnsignedInteger,
} from '../nolimits-stream';

export type FileScript = ReturnType<typeof readFileScript>;

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

export const writeFileScript = (
  stream: NoLimitsStream,
  fileScript: FileScript,
): void => {
  writeUnsignedInteger(stream, fileScript.paths.length);
  for (const path of fileScript.paths) {
    writeString(stream, path);
    writeNull(stream, 8);
  }

  writeNull(stream, 8);
};
