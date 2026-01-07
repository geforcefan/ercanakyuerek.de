import React, { useMemo } from 'react';
import { useControls } from 'leva';
import { Matrix4, Vector3 } from 'three';

import { applyRollCurve } from '../../../../maths/curve';
import { toPosition } from '../../../../maths/matrix4';
import { fromURL } from '../../../../helper/nl2park/nl2park';
import {
  curveFromCustomTrack,
  rollPointsFromCustomTrack,
} from '../../../../helper/nolimits';

import { CurveWireframe } from '../../../../components/curve/CurveWireframe';
import { Ground } from '../../../../components/Ground';
import { TrainWithPhysics } from '../../../../components/TrainWithPhysics';
import { PerspectiveScene } from '../../../../scenes/PerspectiveScene';

import { fromRollPoints } from '../../../../coaster/cubic-roll';
// @ts-ignore
import LookAtExample from './LookAtExample.nl2park';

const exampleCoaster = (await fromURL(LookAtExample)).coaster[0];
const exampleTrack = exampleCoaster?.tracks[0];

export const LookAtExampleScene = () => {
  const { lookAt } = useControls({
    lookAt: {
      options: ['fixedUpDirection', 'incremental'],
      value: 'fixedUpDirection',
    },
  });

  const curve = useMemo(() => {
    const trackCurve = curveFromCustomTrack(exampleTrack, false);

    if (lookAt === 'fixedUpDirection') {
      return trackCurve.map((node, index, trackCurve) => {
        const isLast = index === trackCurve.length - 1;
        const left = toPosition(
          isLast ? trackCurve[index - 1].matrix : node.matrix,
        );
        const right = toPosition(
          isLast ? node.matrix : trackCurve[index + 1].matrix,
        );
        return {
          ...node,
          matrix: new Matrix4()
            .lookAt(right, left, new Vector3(0, 1, 0))
            .setPosition(left),
        };
      });
    } else return trackCurve;
  }, [lookAt]);

  const curveWithRoll = useMemo(() => {
    return applyRollCurve(
      curve,
      fromRollPoints(curve, rollPointsFromCustomTrack(exampleTrack)),
    );
  }, [curve]);

  return (
    <>
      <PerspectiveScene>
        <CurveWireframe curve={curveWithRoll} />
        <TrainWithPhysics
          curve={curveWithRoll}
          activateCamera={true}
          init={{ velocity: 22 }}
        />
        <Ground />
      </PerspectiveScene>
    </>
  );
};
