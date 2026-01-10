import React, { useMemo } from 'react';
import { useControls } from 'leva';
import { Matrix4, Vector3 } from 'three';

import {
  applyRollCurve,
  emptyCurve,
  toLocalTransformed,
} from '../../../../maths/curve';
import { toPosition } from '../../../../maths/matrix4';
import { fromURL } from '../../../../helper/nl2park/nl2park';
import {
  curveFromCustomTrack,
  rollPointsFromCustomTrack,
} from '../../../../helper/nolimits';

import { CurveWireframe } from '../../../../components/curve/CurveWireframe';
import { Ground } from '../../../../components/Ground';
import { PerspectiveScene } from '../../../../components/scenes/PerspectiveScene';
import { TrainWithPhysics } from '../../../../components/TrainWithPhysics';

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
      return emptyCurve(
        trackCurve.nodes.map((node, index, nodes) => {
          const isLast = index === nodes.length - 1;
          const left = toPosition(
            isLast ? nodes[index - 1].matrix : node.matrix,
          );
          const right = toPosition(
            isLast ? node.matrix : nodes[index + 1].matrix,
          );
          return {
            ...node,
            matrix: new Matrix4()
              .lookAt(right, left, new Vector3(0, 1, 0))
              .setPosition(left),
          };
        }),
        trackCurve.segmentOffsets,
      );
    } else return trackCurve;
  }, [lookAt]);

  const curveWithRoll = useMemo(() => {
    return toLocalTransformed(
      applyRollCurve(
        curve,
        fromRollPoints(
          curve,
          rollPointsFromCustomTrack(exampleTrack),
        ),
      ),
      new Vector3(0, -1.1, 0),
    );
  }, [curve]);

  return (
    <>
      <PerspectiveScene>
        <CurveWireframe curve={curveWithRoll} />
        <TrainWithPhysics
          curve={curveWithRoll}
          activateCamera={true}
          init={{ velocity: 23 }}
        />
        <Ground />
      </PerspectiveScene>
    </>
  );
};
