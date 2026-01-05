import React, { useMemo } from 'react';
import { useControls } from 'leva';

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
import ParkCSV from './Venom.csv';
// @ts-ignore
import Park from './Venom.nl2park';

const exampleCoaster = (await fromURL(Park)).coaster[0];
const exampleTrack = exampleCoaster?.tracks[0];
const exampleCurveCSV = await curveFromCSVUrl(ParkCSV);

export const NoLimitsTrackScene = () => {
  const colors = useColors();

  const { pov } = useControls({
    pov: true,
  });
  const curve = useMemo(() => curveFromCustomTrack(exampleTrack), []);

  return (
    <>
      <PerspectiveScene>
        <Ground />
        <DefaultCameraControls />
        <TrainWithPhysics
          curve={curve}
          activateCamera={pov}
          init={{ velocity: 3, distanceTraveled: 115 }}
        />
        <CurveWireframe color={colors.secondary} curve={curve} />
        <CurveWireframe
          color={colors.highlight}
          curve={exampleCurveCSV}
        />
      </PerspectiveScene>
    </>
  );
};
