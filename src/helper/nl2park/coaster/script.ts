import {
  NoLimitsStream,
  readBoolean,
  readNull,
  readString,
  readUnsignedInteger,
  writeBoolean,
  writeNull,
  writeString,
  writeUnsignedInteger,
} from '../nolimits-stream';

export type Script = ReturnType<typeof readScript>;

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

export const writeScript = (
  stream: NoLimitsStream,
  script: Script,
): void => {
  writeNull(stream, 4);

  writeString(stream, script.classPath);
  writeString(stream, script.scriptClass);

  writeUnsignedInteger(stream, script.resourceFiles.length);
  for (const res of script.resourceFiles) {
    writeString(stream, res.id);
    writeString(stream, res.path);
  }

  writeBoolean(stream, !script.privateVirtualMachine);

  writeNull(stream, 7);
};
