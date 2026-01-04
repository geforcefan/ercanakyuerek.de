import React, { useMemo, useState } from 'react';
import {
  CameraControls,
  CameraControlsImpl,
  Line,
  PerspectiveCamera,
} from '@react-three/drei';
import { useControls } from 'leva';
import { MathUtils, Matrix4, Vector3, Vector4 } from 'three';

import {
  CurveNode,
  fromPointsWithBasicNormals,
} from '../../../../maths/curve';
import {
  fromPoints,
  makeClampedKnots,
} from '../../../../maths/nurbs';
import { fromMatrix4 } from '../../../../maths/vector3';
import { fromURL } from '../../../../helper/nl2park/nl2park';
import { applyRollFromCustomTrack } from '../../../../helper/nolimits';
import { useColors } from '../../../../hooks/useColors';
import { useMotionSimulation } from '../../../../hooks/useMotionSimulation';

import { CurveWireframe } from '../../../../components/CurveWireframe';
import { DragControlPoints } from '../../../../components/DragControlPoints';
import { Ground } from '../../../../components/Ground';
import { PointWithMatrixArrows } from '../../../../components/PointWithMatrixArrows';
import { PerspectiveScene } from '../../../../scenes/PerspectiveScene';

// @ts-ignore
import LookAtExample from './LookAtExample.nl2park';

const exampleCoaster = (await fromURL(LookAtExample)).coaster[0];
const exampleTrack = exampleCoaster?.tracks[0];

const MotionSimulation = ({
  curve,
  pov,
}: {
  curve: CurveNode[];
  pov?: boolean;
}) => {
  const motionMatrix = useMotionSimulation(curve, { velocity: 22 });

  const povMatrix = useMemo(
    () =>
      motionMatrix
        .clone()
        .multiply(
          new Matrix4().makeRotationY(MathUtils.degToRad(180)),
        )
        .multiply(new Matrix4().makeTranslation(0, 1, 0)),
    [motionMatrix],
  );

  return (
    <>
      {!pov && <PointWithMatrixArrows matrix={motionMatrix} />}
      <PerspectiveCamera
        matrix={povMatrix}
        matrixAutoUpdate={false}
        fov={100}
        makeDefault={pov}
      />
      <CameraControls
        makeDefault={!pov}
        dollyToCursor={true}
        draggingSmoothTime={0.03}
        dollySpeed={0.4}
        infinityDolly={true}
        dollyDragInverted={true}
        minDistance={0}
        maxDistance={Infinity}
        mouseButtons={{
          left: CameraControlsImpl.ACTION.ROTATE,
          right: CameraControlsImpl.ACTION.TRUCK,
          wheel: CameraControlsImpl.ACTION.DOLLY,
          middle: CameraControlsImpl.ACTION.NONE,
        }}
      />
      <Ground />
    </>
  );
};

export const LookAtExampleScene = () => {
  const colors = useColors();

  const [points, setPoints] = useState(
    exampleTrack?.vertices.map((v) =>
      new Vector4().fromArray(v.position),
    ),
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

    applyRollFromCustomTrack(curve, exampleTrack);

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
        <MotionSimulation curve={curve} pov={pov} />
      </PerspectiveScene>
    </>
  );
};
