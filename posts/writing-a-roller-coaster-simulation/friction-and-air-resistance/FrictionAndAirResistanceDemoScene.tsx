import React, { useEffect, useState } from 'react';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';

import {
  forwardDirectionAtArcLength,
  positionAtArcLength,
  totalArcLength,
} from '../../../../maths/linear';
import {
  evaluateMotionByForwardDirection,
  evaluateMotionByForwardDirectionWithFriction,
} from '../../../../helper/physics';
import { useColors } from '../../../../hooks/useColors';
import { useSimulationStateControls } from '../../../../hooks/useSimulationStateControls';

import { ControlPoint } from '../../../../components/ControlPoint';
import { DragControlPoints } from '../../../../components/DragControlPoints';
import { OrthographicScene } from '../../../../scenes/OrthographicScene';

const FrictionAndAirResistanceDemo = () => {
  const colors = useColors();

  // control points
  const [points, setPoints] = useState([
    new Vector3(-11.5, 3.2, 0),
    new Vector3(0, -2.8, 0),
  ]);

  const [simulationState, setSimulationState] =
    useSimulationStateControls();

  const [
    simulationStateWithoutFriction,
    setSimulationStateWithoutFriction,
  ] = useState(() => ({
    velocity: 0,
    distanceTraveled: 0,
    acceleration: 0,
  }));

  useFrame((state, deltaTime) => {
    // with friction and air resistance
    setSimulationState(
      evaluateMotionByForwardDirectionWithFriction(
        simulationState,
        forwardDirectionAtArcLength(
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

    // without energy loss
    setSimulationStateWithoutFriction(
      evaluateMotionByForwardDirection(
        simulationStateWithoutFriction,
        forwardDirectionAtArcLength(
          points[0],
          points[1],
          simulationStateWithoutFriction.distanceTraveled,
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

      setSimulationStateWithoutFriction({
        velocity: 0,
        distanceTraveled: 0,
        acceleration: 0,
      });
    }
  }, [
    simulationState.distanceTraveled,
    points,
    setSimulationState,
    setSimulationStateWithoutFriction,
  ]);

  const trainPosition = positionAtArcLength(
    points[0],
    points[1],
    MathUtils.clamp(
      simulationState.distanceTraveled,
      0,
      totalArcLength(points[0], points[1]),
    ),
  );

  const trainPositionWithoutFriction = positionAtArcLength(
    points[0],
    points[1],
    MathUtils.clamp(
      simulationStateWithoutFriction.distanceTraveled,
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

      <ControlPoint
        position={trainPosition}
        color={colors.highlight}
      />
      <ControlPoint position={trainPositionWithoutFriction} />
    </>
  );
};

export const FrictionAndAirResistanceDemoScene = () => {
  return (
    <OrthographicScene>
      <FrictionAndAirResistanceDemo />
    </OrthographicScene>
  );
};
