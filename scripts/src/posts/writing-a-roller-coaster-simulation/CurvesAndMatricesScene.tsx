import React, { useState } from 'react';
import { CameraControls } from '@react-three/drei';
import { Color, Vector3 } from 'three';

import BezierCurve from '../../components/BezierCurve';
import { DragControlPoints } from '../../components/DragControlPoints';
import Line from '../../components/Line';
import useColors from '../../hooks/useColors';
import PerspectiveScene from '../../scenes/PerspectiveScene';

const CurvesAndMatrices = () => {
  const colors = useColors();

  const [points, setPoints] = useState([
    new Vector3(-3, -3, 0),
    new Vector3(3, -3, 0),
    new Vector3(-3, 3, 0),
    new Vector3(3, 3, 0),
  ]);

  return (
    <>
      <Line points={points} color={colors.secondary} />
      <BezierCurve points={points} resolution={2.5} />
      <DragControlPoints points={points} setPoints={setPoints} />
    </>
  );
};

export const CurvesAndMatricesScene = () => {
  return (
    <PerspectiveScene>
      <gridHelper
        args={[
          100,
          100,
          new Color(0xdddddd).convertSRGBToLinear(),
          new Color(0xdddddd).convertSRGBToLinear(),
        ]}
      />
      <CameraControls makeDefault dollyToCursor={true} />
      <CurvesAndMatrices />
    </PerspectiveScene>
  );
};
