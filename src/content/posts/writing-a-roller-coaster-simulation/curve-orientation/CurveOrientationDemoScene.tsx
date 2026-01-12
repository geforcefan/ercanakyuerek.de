import React, { useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import { useControls } from 'leva';
import { Vector3 } from 'three';

import { bezierSplineCurve } from '../../../../maths/bezier';
import { useColors } from '../../../../hooks/useColors';

import { CurveWireframe } from '../../../../components/curve/CurveWireframe';
import { DragControlPoints } from '../../../../components/curve/DragControlPoints';
import { Ground } from '../../../../components/Ground';
import { PerspectiveScene } from '../../../../components/scenes/PerspectiveScene';
import { TrainWithPhysics } from '../../../../components/TrainWithPhysics';

export const CurveOrientationDemoScene = () => {
  const { pov } = useControls({ pov: false });

  const colors = useColors();

  const [points, setPoints] = useState([
    new Vector3(0, 0, 0),
    new Vector3(12, -5, 0),
    new Vector3(12, 15, 0),
    new Vector3(0, 10, 0),
  ]);

  const curve = useMemo(() => bezierSplineCurve(points), [points]);

  return (
    <PerspectiveScene cameraControlsActive={!pov}>
      <group position={[-15, -5, -10]}>
        <Line
          points={points}
          color={colors.highlight}
          segments={true}
        />
        <DragControlPoints points={points} setPoints={setPoints} />
        <CurveWireframe curve={curve} />
        <TrainWithPhysics
          curve={curve}
          init={{ velocity: 17 }}
          activateCamera={pov}
        />
      </group>
      <group position={[0, -10, 0]}>
        <Ground />
      </group>
    </PerspectiveScene>
  );
};
