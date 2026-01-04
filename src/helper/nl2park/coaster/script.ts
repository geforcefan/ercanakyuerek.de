import {
  NoLimitsStream,
  readBoolean,
  readNull,
  readString,
  readUnsignedInteger,
} from '../nolimits-stream';

export const readScript = (stream: NoLimitsStream) => {
  const resourceFiles: Array<{
    id: string;
    path: string;
  }> = [];

  readNull(stream, 4);

  const classPath = readString(stream);
  const scriptClass = readString(stream);

  const numberOfResourceFiles = readUnsignedInteger(stream);
  for (let i = 0; i < numberOfResourceFiles; i++) {
    resourceFiles.push({
      id: readString(stream),
      path: readString(stream),
    });
  }

  const privateVirtualMachine = !readBoolean(stream);

  readNull(stream, 7);

  return {
    classPath,
    scriptClass,
    resourceFiles,
    privateVirtualMachine,
  };
};
