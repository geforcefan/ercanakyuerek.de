import React, { useEffect, useState } from 'react';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';

import {
  matrixAtArcLength,
  totalArcLength,
} from '../../../../maths/linear';
import { evaluateMotion } from '../../../../helper/physics';
import { useColors } from '../../../../hooks/useColors';
import { useSimulationStateControls } from '../../../../hooks/useSimulationStateControls';

import { DragControlPoints } from '../../../../components/curve/DragControlPoints';
import { PointWithMatrixArrows } from '../../../../components/PointWithMatrixArrows';
import { OrthographicScene } from '../../../../components/scenes/OrthographicScene';

const MatricesDemo = () => {
  const colors = useColors();

  // control points
  const [points, setPoints] = useState([
    new Vector3(-11.5, 3.2, 0),
    new Vector3(0, -2.8, 0),
  ]);

  const [simulationState, setSimulationState] =
    useSimulationStateControls();

  useFrame((state, deltaTime) => {
    setSimulationState(
      evaluateMotion(
        simulationState,
        matrixAtArcLength(
          points[0],
          points[1],
          simulationState.distanceTraveled,
        ),
        simulationState.friction,
        simulationState.airResistance,
        simulationState.gravity,
        deltaTime * simulationState.simulationSpeed,
      ),
    );
  });

  // reset simulation state if train overshoots track
  useEffect(() => {
    if (
      simulationState.distanceTraveled >
        totalArcLength(points[0], points[1]) ||
      simulationState.distanceTraveled < 0
    ) {
      setSimulationState({
        velocity: 0,
        distanceTraveled: 0,
        acceleration: 0,
      });
    }
  }, [simulationState.distanceTraveled, points, setSimulationState]);

  const motionMatrix = matrixAtArcLength(
    points[0],
    points[1],
    MathUtils.clamp(
      simulationState.distanceTraveled,
      0,
      totalArcLength(points[0], points[1]),
    ),
  );

  return (
    <>
      <DragControlPoints
        axisLock="z"
        points={points}
        setPoints={setPoints}
      />
      <Line points={points} color={colors.secondary} />
      <PointWithMatrixArrows matrix={motionMatrix} />
    </>
  );
};

export const MatricesDemoScene = () => {
  return (
    <OrthographicScene>
      <MatricesDemo />
    </OrthographicScene>
  );
};
