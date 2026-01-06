import React, { useMemo } from 'react';
import { useControls } from 'leva';

import {
  fromPointsWithBasicNormals,
  toSegmentOffsets,
  totalArcLength,
} from '../../../../maths/curve';
import { fromURL } from '../../../../helper/nl2park/nl2park';
import {
  applyRollFromCustomTrack,
  curveFromCustomTrack,
} from '../../../../helper/nolimits';

import { CurveWireframe } from '../../../../components/curve/CurveWireframe';
import { Ground } from '../../../../components/Ground';
import { TrainWithPhysics } from '../../../../components/TrainWithPhysics';
import { PerspectiveScene } from '../../../../scenes/PerspectiveScene';

// @ts-ignore
import LookAtExample from './LookAtExample.nl2park';
import { toPosition } from '../../../../maths/matrix4';

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
    const trackCurve = curveFromCustomTrack(exampleTrack);
    const numberOfSegments = exampleTrack.vertices.length - 1;

    const linearSegmentOffsets = toSegmentOffsets(
      new Array(numberOfSegments).fill(
        totalArcLength(trackCurve) / numberOfSegments,
      ),
    );

    if (lookAt === 'fixedUpDirection') {
      const fixedUpDirectionCurve = fromPointsWithBasicNormals(
        trackCurve.map((node) => toPosition(node.matrix)),
      );
      applyRollFromCustomTrack(
        fixedUpDirectionCurve,
        linearSegmentOffsets,
        exampleTrack,
      );
      return fixedUpDirectionCurve;
    } else return trackCurve;
  }, [lookAt]);

  return (
    <>
      <PerspectiveScene>
        <CurveWireframe curve={curve} />
        <TrainWithPhysics
          curve={curve}
          activateCamera={true}
          init={{ velocity: 22 }}
        />
        <Ground />
      </PerspectiveScene>
    </>
  );
};
