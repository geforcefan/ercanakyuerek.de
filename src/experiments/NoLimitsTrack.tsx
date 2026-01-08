import React from 'react';
import { Line } from '@react-three/drei';
import { useControls } from 'leva';
import { Vector3 } from 'three';

import { fromURL, toArrayBuffer } from '../helper/nl2park/nl2park';
import { curveFromCustomTrack } from '../helper/nolimits';
import { useColors } from '../hooks/useColors';

import { DefaultCameraControls } from '../components/camera/DefaultCameraControls';
import { CurveWireframe } from '../components/curve/CurveWireframe';
import { DragControlPoints } from '../components/curve/DragControlPoints';
import { Ground } from '../components/Ground';
import { TrainWithPhysics } from '../components/TrainWithPhysics';
import { PerspectiveScene } from '../scenes/PerspectiveScene';

import { fromUrl } from '../coaster/nolimits-csv-track';
// @ts-ignore
import ParkCSV from './Experiment.csv';
// @ts-ignore
import Park from './Experiment.nl2park';

const park = await fromURL(Park);
const exampleCoaster = park.coaster[0];
const exampleTrack = exampleCoaster?.tracks[0];
const points = exampleTrack?.vertices.map((v) =>
  new Vector3().fromArray(v.position),
);

const exampleTrackCurve = curveFromCustomTrack(exampleTrack, false);

const exampleCSVCurve = await fromUrl(ParkCSV);

const parkBuffer = toArrayBuffer(park);

export const NoLimitsTrackScene = () => {
  const colors = useColors();

  const { pov } = useControls({
    pov: true,
  });

  return (
    <>
      <PerspectiveScene>
        <Ground />
        <DragControlPoints points={points} setPoints={() => {}} />
        <Line points={points} color={colors.secondary} />
        {!pov && <DefaultCameraControls />}
        <CurveWireframe
          color={colors.secondary}
          curve={exampleTrackCurve}
        />
        <group position={new Vector3(0, -0.1, 0)}>
          <CurveWireframe
            color={colors.highlight}
            curve={exampleCSVCurve}
          />
        </group>
        <TrainWithPhysics
          curve={exampleTrackCurve}
          activateCamera={pov}
          init={{
            velocity: 10,
            distanceTraveled: 0,
          }}
        />
      </PerspectiveScene>
      <a
        href={URL.createObjectURL(
          new Blob([parkBuffer], {
            type: 'application/octet-stream',
          }),
        )}
        download="vertex.nl2park"
      >
        Download Vertex
      </a>
    </>
  );
};
