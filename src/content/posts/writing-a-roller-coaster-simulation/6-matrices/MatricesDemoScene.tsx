import React, { useEffect, useState } from 'react';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';

import { length, matrixAtDistance } from '../../../../maths/linear';
import { evaluateMotionByMatrixWithEnergyLoss } from '../../../../helper/physics';
import { useColors } from '../../../../hooks/useColors';
import { useSimulationStateControls } from '../../../../hooks/useSimulationStateControls';

import { ControlPoint } from '../../../../components/ControlPoint';
import { DragControlPoints } from '../../../../components/DragControlPoints';
import { MatrixArrowHelper } from '../../../../components/MatrixArrowHelper';
import { OrthographicScene } from '../../../../scenes/OrthographicScene';

const MatricesDemo = () => {
  const colors = useColors();

  // control points
  const [points, setPoints] = useState([
    new Vector3(-11.5, 3.2, 0),
    new Vector3(1.4, -2.8, 0),
  ]);

  const [simulationState, setSimulationState] =
    useSimulationStateControls();

  useFrame((state, deltaTime) => {
    setSimulationState(
      evaluateMotionByMatrixWithEnergyLoss(
        simulationState,
        matrixAtDistance(
          points[0],
          points[1],
          simulationState.distanceTraveled,
        ),
        simulationState.friction,
        simulationState.airResistance,
        simulationState.gravity,
        deltaTime,
      ),
    );
  });

  // reset simulation state if train overshoots track
  useEffect(() => {
    if (
      simulationState.distanceTraveled >
        length(points[0], points[1]) ||
      simulationState.distanceTraveled < 0
    ) {
      setSimulationState({
        velocity: 0,
        distanceTraveled: 0,
        acceleration: 0,
      });
    }
  }, [simulationState.distanceTraveled, points, setSimulationState]);

  const trainMatrix = matrixAtDistance(
    points[0],
    points[1],
    MathUtils.clamp(
      simulationState.distanceTraveled,
      0,
      length(points[0], points[1]),
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
      <group matrixAutoUpdate={false} matrix={trainMatrix}>
        <MatrixArrowHelper />
        <ControlPoint color={colors.highlight} />
      </group>
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
