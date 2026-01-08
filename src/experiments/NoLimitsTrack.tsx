import React from 'react';
import { Line } from '@react-three/drei';
import { useControls } from 'leva';
import { Vector3 } from 'three';

import { toLocalTransformed } from '../maths/curve';
import { fromURL } from '../helper/nl2park/nl2park';
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
import ParkCSV from './Hybris.csv';
// @ts-ignore
import Park from './Hybris.nl2park';

const exampleCoaster = (await fromURL(Park)).coaster[0];
const exampleTrack = exampleCoaster?.tracks[0];
const points = exampleTrack?.vertices.map((v) =>
  new Vector3().fromArray(v.position),
);

const exampleTrackCurve = toLocalTransformed(
  curveFromCustomTrack(exampleTrack),
  new Vector3(0, -1.1, 0),
);
const exampleCSVCurve = await fromUrl(ParkCSV);

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
        <DefaultCameraControls />
        <CurveWireframe
          color={colors.secondary}
          curve={exampleTrackCurve}
        />
        <CurveWireframe
          color={colors.highlight}
          curve={exampleCSVCurve}
        />
        <TrainWithPhysics
          curve={exampleTrackCurve}
          activateCamera={pov}
          init={{
            velocity: 30,
            distanceTraveled: 190,
          }}
        />
      </PerspectiveScene>
    </>
  );
};
