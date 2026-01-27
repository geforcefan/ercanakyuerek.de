import React from 'react';
import { useControls } from 'leva';
import { Vector3 } from 'three';

import { toLocalTransformed } from '../maths/curve';
import { fromURL } from '../helper/nl2park/nl2park';
import { curveFromCustomTrack } from '../helper/nolimits';
import { useColors } from '../hooks/useColors';

import { PerspectiveCameraControls } from '../components/camera/PerspectiveCameraControls';
import { CurveWireframe } from '../components/curve/CurveWireframe';
import { Ground } from '../components/Ground';
import { PerspectiveScene } from '../components/scenes/PerspectiveScene';
import { TrainWithPhysics } from '../components/TrainWithPhysics';

import { fromUrl } from '../coaster/nolimits-csv-track';
import ParkCSV from './Experiment.csv';
import Park from './Experiment.nl2park';

const park = await fromURL(Park);
const exampleCoaster = park.coaster[0];
const exampleTrack = exampleCoaster?.tracks[0];

const exampleTrackCurve = toLocalTransformed(
  curveFromCustomTrack(exampleTrack, true),
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
        {/*<DragControlPoints points={points} setPoints={() => {}} />
        <Line points={points} color={colors.secondary} />*/}
        {!pov && <PerspectiveCameraControls />}
        <CurveWireframe
          color={colors.highlight}
          curve={exampleCSVCurve}
        />
        <CurveWireframe
          color={colors.secondary}
          curve={exampleTrackCurve}
        />
        <TrainWithPhysics
          curve={exampleTrackCurve}
          init={{
            velocity: 7,
            distanceTraveled: 186,
            friction: 0.026,
            airResistance: 2e-5,
          }}
        />
      </PerspectiveScene>
    </>
  );
};
