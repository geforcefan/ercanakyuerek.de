import React from 'react';
import { Stats } from '@react-three/drei';
import { Vector3 } from 'three';

import { toLocalTransformed } from '../../../../maths/curve';
import { fromURL } from '../../../../helper/nl2park/nl2park';
import { curveFromCustomTrack } from '../../../../helper/nolimits';

import { CurveTrackMesh } from '../../../../components/curve/CurveTrackMesh';
import { AtmosphericPerspectiveScene } from '../../../../components/scenes/AtmosphericPerspectiveScene';
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
      <AtmosphericPerspectiveScene>
        <Stats />

        <group receiveShadow={true} position={[0, -7, 0]}>
          <mesh receiveShadow={true} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial color={'dark-green'} />
          </mesh>
        </group>

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
      </AtmosphericPerspectiveScene>
    </>
  );
};
