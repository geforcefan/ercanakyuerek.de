import React from 'react';
import { useControls } from 'leva';
import { Vector3 } from 'three';

import { toLocalTransformed } from '../../../../maths/curve';
import { fromURL } from '../../../../helper/nl2park/nl2park';
import { curveFromCustomTrack } from '../../../../helper/nolimits';
import { useColors } from '../../../../hooks/useColors';

import { CurveWireframe } from '../../../../components/curve/CurveWireframe';
import { Ground } from '../../../../components/Ground';
import { PerspectiveScene } from '../../../../components/scenes/PerspectiveScene';
import { TrainWithPhysics } from '../../../../components/TrainWithPhysics';

import Park from './Hybris.nl2park';

const exampleCoaster = (await fromURL(Park)).coaster[0];
const exampleTrack = exampleCoaster?.tracks[0];

const exampleTrackCurve = toLocalTransformed(
  curveFromCustomTrack(exampleTrack),
  new Vector3(0, -1.1, 0),
);

export const NurbsRollPhysicsInActionDemoScene = () => {
  const colors = useColors();

  const { pov } = useControls({
    pov: true,
  });

  return (
    <>
      <PerspectiveScene withCameraControls={!pov}>
        <Ground position={new Vector3(0, -7, 0)} />
        <CurveWireframe
          color={colors.secondary}
          curve={exampleTrackCurve}
        />
        <TrainWithPhysics
          curve={exampleTrackCurve}
          activateCamera={pov}
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
