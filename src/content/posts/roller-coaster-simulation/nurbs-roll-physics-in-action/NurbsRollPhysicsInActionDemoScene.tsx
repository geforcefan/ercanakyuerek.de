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

import Park from './Example.nl2park';

const exampleCoaster = (await fromURL(Park)).coaster[0];
const exampleTrack = exampleCoaster?.tracks[2];

const exampleTrackCurve = toLocalTransformed(
  curveFromCustomTrack(exampleTrack),
  new Vector3(0, -1.2, 0),
);

export const NurbsRollPhysicsInActionDemoScene = () => {
  return (
    <>
      <PerspectiveScene>
        <Stats />
        <Ground position={[0, -7, 0]} />
        <CurveTrackMesh curve={exampleTrackCurve} />
        <TrainWithPhysics
          curve={exampleTrackCurve}
          sections={[
            {
              acceleration: 0.5 * 9.81665,
              fromArcLength: 0,
              toArcLength: 15.38,
              maxVelocity: 8 / 3.6,
            },
            {
              acceleration: 0.5 * 9.81665,
              fromArcLength: 15.38,
              toArcLength: 18.92,
              maxVelocity: 9.654 / 3.6,
            },
            {
              acceleration: 0.5 * 9.81665,
              fromArcLength: 44.43,
              toArcLength: 60.16,
              maxVelocity: 12.872 / 3.6,
            },
            {
              acceleration: 0.8 * 9.81665,
              fromArcLength: 60.16,
              toArcLength: 113.83,
              maxVelocity: 85.277 / 3.6,
            },
            {
              acceleration: -1 * 9.81665,
              fromArcLength: 715.1,
              toArcLength: 735.54,
              minVelocity: 12.872 / 3.6,
            },
          ]}
          init={{
            velocity: 0,
            distanceTraveled: 13,
            friction: 0.026,
            airResistance: 2e-5,
          }}
          activateCamera={true}
          resetWhenReachedLimit={false}
        />
      </PerspectiveScene>
    </>
  );
};
