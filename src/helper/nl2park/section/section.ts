import {
  makeChunkReader,
  NoLimitsStream,
  readChunks,
  readNull,
  readString,
  readUnsignedInteger,
  writeChunk,
  writeNull,
  writeString,
  writeUnsignedInteger,
} from '../nolimits-stream';
import {
  BrakeSection,
  readBrakeSection,
  writeBrakeSection,
} from './brake-section';
import {
  LiftSection,
  readLiftSection,
  writeLiftSection,
} from './lift-section';
import {
  readStationSection,
  StationSection,
  writeStationSection,
} from './station-section';
import {
  readStorageSection,
  StorageSection,
  writeStorageSection,
} from './storage-section';
import {
  readTransportSection,
  TransportSection,
  writeTransportSection,
} from './transport-section';

export type Section = {
  name: string;
} & (
  | ({
      sectionType: SectionType.Lift;
    } & LiftSection)
  | ({
      sectionType: SectionType.Transport;
    } & TransportSection)
  | ({
      sectionType: SectionType.Brake;
    } & BrakeSection)
  | ({
      sectionType: SectionType.Station;
    } & StationSection)
  | ({
      sectionType: SectionType.Storage;
    } & StorageSection)
  | {
      sectionType: SectionType.Track;
    }
);

export enum SectionType {
  Track = 0,
  Station = 1,
  Lift = 2,
  Transport = 3,
  Brake = 4,
  Storage = 5,
}

export const readSection = (stream: NoLimitsStream) => {
  readUnsignedInteger(stream); // section type
  const name = readString(stream);
  readNull(stream, 26);

  let section:
    | ({
        sectionType: SectionType.Lift;
      } & LiftSection)
    | ({
        sectionType: SectionType.Transport;
      } & TransportSection)
    | ({
        sectionType: SectionType.Brake;
      } & BrakeSection)
    | ({
        sectionType: SectionType.Station;
      } & StationSection)
    | ({
        sectionType: SectionType.Storage;
      } & StorageSection)
    | {
        sectionType: SectionType.Track;
      } = { sectionType: SectionType.Track };

  readChunks(
    [
      makeChunkReader(readLiftSection, 'LIFT', (lift) => {
        section = {
          sectionType: SectionType.Lift,
          ...lift,
        };
      }),
      makeChunkReader(readTransportSection, 'TRNS', (transport) => {
        section = {
          sectionType: SectionType.Transport,
          ...transport,
        };
      }),
      makeChunkReader(readBrakeSection, 'BRKE', (brake) => {
        section = {
          sectionType: SectionType.Brake,
          ...brake,
        };
      }),
      makeChunkReader(readStationSection, 'STTN', (station) => {
        section = {
          sectionType: SectionType.Station,
          ...station,
        };
      }),
      makeChunkReader(readStorageSection, 'STOR', (storage) => {
        section = {
          sectionType: SectionType.Storage,
          ...storage,
        };
      }),
    ],
    stream,
  );

  return {
    name,
    ...section,
  };
};

export const writeSection = (
  stream: NoLimitsStream,
  section: Section,
): void => {
  writeUnsignedInteger(stream, section.sectionType);
  writeString(stream, section.name);
  writeNull(stream, 26);

  switch (section.sectionType) {
    case SectionType.Lift:
      writeChunk(stream, 'LIFT', (s) => writeLiftSection(s, section));
      break;

    case SectionType.Transport:
      writeChunk(stream, 'TRNS', (s) =>
        writeTransportSection(s, section),
      );
      break;

    case SectionType.Brake:
      writeChunk(stream, 'BRKE', (s) =>
        writeBrakeSection(s, section),
      );
      break;

    case SectionType.Station:
      writeChunk(stream, 'STTN', (s) =>
        writeStationSection(s, section),
      );
      break;

    case SectionType.Storage:
      writeChunk(stream, 'STOR', (s) =>
        writeStorageSection(s, section),
      );
      break;
  }
};
