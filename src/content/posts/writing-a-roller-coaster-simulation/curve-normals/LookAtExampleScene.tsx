import React, { useMemo } from 'react';
import {
  Line,
} from '@react-three/drei';
import { useControls } from 'leva';
import { Vector3, Vector4 } from 'three';

import {
  fromPointsWithBasicNormals, toSegmentOffsets,
} from '../../../../maths/curve';
import {
  fromPoints,
  makeClampedKnots,
} from '../../../../maths/nurbs';
import { fromMatrix4 } from '../../../../maths/vector3';
import { fromURL } from '../../../../helper/nl2park/nl2park';
import { applyRollFromCustomTrack } from '../../../../helper/nolimits';
import { useColors } from '../../../../hooks/useColors';

import { CurveWireframe } from '../../../../components/curve/CurveWireframe';
import { DefaultCameraControls } from '../../../../components/camera/DefaultCameraControls';
import { Ground } from '../../../../components/Ground';
import { TrainWithPhysics } from '../../../../components/TrainWithPhysics';
import { PerspectiveScene } from '../../../../scenes/PerspectiveScene';

// @ts-ignore
import LookAtExample from './LookAtExample.nl2park';

const exampleCoaster = (await fromURL(LookAtExample)).coaster[0];
const exampleTrack = exampleCoaster?.tracks[0];

export const LookAtExampleScene = () => {
  const colors = useColors();

  const points = useMemo(
    () =>
      exampleTrack?.vertices.map((v) =>
        new Vector4().fromArray(v.position),
      ),
    [],
  );

  const { lookAt, pov } = useControls({
    lookAt: {
      options: ['fixedUpDirection', 'incrementalRotation'],
      value: 'fixedUpDirection',
    },
    pov: true,
  });

  const curve = useMemo(() => {
    const nurbsCurve = fromPoints(points, makeClampedKnots);

    const curve =
      lookAt === 'fixedUpDirection'
        ? fromPointsWithBasicNormals(
            nurbsCurve.map((node) => fromMatrix4(node.matrix)),
          )
        : nurbsCurve;

    const segmentOffsets = toSegmentOffsets(
      curve,
      points.length,
    );

    applyRollFromCustomTrack(curve, segmentOffsets, exampleTrack);

    return curve;
  }, [points, lookAt]);

  return (
    <>
      <PerspectiveScene>
        {!pov && (
          <>
            <Line
              points={points?.map((p) =>
                new Vector3().fromArray(p.toArray()),
              )}
              color={colors.highlight}
            />
          </>
        )}
        <CurveWireframe curve={curve} />
        <TrainWithPhysics
          curve={curve}
          activateCamera={pov}
          init={{ velocity: 22 }}
        />
        <DefaultCameraControls makeDefault={!pov} />
        <Ground />
      </PerspectiveScene>
    </>
  );
};
