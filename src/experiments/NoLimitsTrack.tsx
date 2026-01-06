import React from 'react';
import { useControls } from 'leva';
import { Vector3 } from 'three';

import { toLocalTransformed } from '../maths/curve';
import { fromURL } from '../helper/nl2park/nl2park';
import {
  curveFromCSVUrl,
  curveFromCustomTrack,
} from '../helper/nolimits';
import { useColors } from '../hooks/useColors';

import { DefaultCameraControls } from '../components/camera/DefaultCameraControls';
import { CurveWireframe } from '../components/curve/CurveWireframe';
import { Ground } from '../components/Ground';
import { TrainWithPhysics } from '../components/TrainWithPhysics';
import { PerspectiveScene } from '../scenes/PerspectiveScene';

// @ts-ignore
import ParkCSV from './Avenger.csv';
// @ts-ignore
import Park from './Valhall.nl2park';

const exampleCoaster = (await fromURL(Park)).coaster[0];
const exampleTrack = exampleCoaster?.tracks[0];

const exampleTrackCurve = toLocalTransformed(
  curveFromCustomTrack(exampleTrack),
  new Vector3(0, -1.6, 0),
);
const exampleCSVCurve = await curveFromCSVUrl(ParkCSV);

export const NoLimitsTrackScene = () => {
  const colors = useColors();

  const { pov } = useControls({
    pov: true,
  });

  return (
    <>
      <PerspectiveScene>
        <Ground />
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
          init={{ velocity: 8, distanceTraveled: 105 }}
        />
      </PerspectiveScene>
    </>
  );
};
