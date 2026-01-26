import React from 'react';
import { Stats } from '@react-three/drei';
import { Vector3 } from 'three';

import { toLocalTransformed } from '../../../../maths/curve';
import { fromURL } from '../../../../helper/nl2park/nl2park';
import { curveFromCustomTrack } from '../../../../helper/nolimits';

import { CurveTrackMesh } from '../../../../components/curve/CurveTrackMesh';
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
  return (
    <>
      <PerspectiveScene>
        <Stats />
        <Ground position={new Vector3(0, -7, 0)} />
        <CurveTrackMesh curve={exampleTrackCurve} />
        <TrainWithPhysics
          curve={exampleTrackCurve}
          init={{
            velocity: 7,
            distanceTraveled: 186,
            friction: 0.026,
            airResistance: 2e-5,
          }}
          activateCamera={true}
        />
      </PerspectiveScene>
    </>
  );
};
