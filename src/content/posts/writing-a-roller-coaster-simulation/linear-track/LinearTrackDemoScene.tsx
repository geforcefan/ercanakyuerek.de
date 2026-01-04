import React, { useEffect, useState } from 'react';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { Vector3 } from 'three';

import {
  forwardDirectionAtArcLength,
  totalArcLength,
  positionAtArcLength,
} from '../../../../maths/linear';
import { evaluateMotionByForwardDirection } from '../../../../helper/physics';
import { useColors } from '../../../../hooks/useColors';

import { ControlPoint } from '../../../../components/ControlPoint';
import { DragControlPoints } from '../../../../components/DragControlPoints';
import { OrthographicScene } from '../../../../scenes/OrthographicScene';

const LinearTrackDemo = () => {
  const colors = useColors();

  // control points
  const [points, setPoints] = useState([
    new Vector3(-11.5, 3.2, 0),
    new Vector3(0, -2.8, 0),
  ]);

  const [simulationState, setSimulationState] = useControls(() => ({
    velocity: 0,
    distanceTraveled: 0,
    acceleration: {
      value: 0,
      pad: 5,
    },
    gravity: {
      value: 9.81665,
      pad: 5,
    },
  }));

  useFrame((state, deltaTime) => {
    setSimulationState(
      evaluateMotionByForwardDirection(
        simulationState,
        forwardDirectionAtArcLength(
          points[0],
          points[1],
          simulationState.distanceTraveled,
        ),
        simulationState.gravity,
        deltaTime,
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
  }, [simulationState.distanceTraveled, setSimulationState, points]);

  const trainPosition = positionAtArcLength(
    points[0],
    points[1],
    simulationState.distanceTraveled,
  );

  return (
    <>
      <DragControlPoints
        axisLock="z"
        points={points}
        setPoints={setPoints}
      />
      <Line points={points} color={colors.secondary} />
      <ControlPoint
        position={trainPosition}
        color={colors.highlight}
      />
    </>
  );
};

export const LinearTrackDemoScene = () => {
  return (
    <OrthographicScene>
      <LinearTrackDemo />
    </OrthographicScene>
  );
};
