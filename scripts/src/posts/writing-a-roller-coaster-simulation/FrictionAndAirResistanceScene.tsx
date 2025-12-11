import React, { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { MathUtils, Vector3 } from 'three';

import { ControlPoint } from '../../components/ControlPoint';
import { DragControlPoints } from '../../components/DragControlPoints';
import Line from '../../components/Line';
import { getForwardDirectionAtDistance, getPositionAtDistance, length } from '../../maths/linear';
import {
  evaluateMotionByForwardDirection,
  evaluateMotionByForwardDirectionWithFriction,
} from '../../helper/physics';
import useColors from '../../hooks/useColors';
import OrthographicScene from '../../scenes/OrthographicScene';

const FrictionAndAirResistance = () => {
  const colors = useColors();

  // Control points
  const [points, setPoints] = useState([new Vector3(-11.5, 3.2, 0), new Vector3(1.4, -2.8, 0)]);

  const [simulationState, setSimulationState] = useControls(() => ({
    velocity: 0,
    distanceTraveled: 0,
    friction: {
      value: 0.03,
      pad: 5,
    },
    airResistance: {
      value: 0.0001,
      pad: 6,
    },
    acceleration: {
      value: 0,
      pad: 5,
    },
    gravity: {
      value: 9.81665,
      pad: 5,
    },
  }));

  const [simulationStateWithoutFriction, setSimulationStateWithoutFriction] = useState(() => ({
    velocity: 0,
    distanceTraveled: 0,
    acceleration: 0,
  }));

  // Main motion evaluation per frame
  useFrame((state, deltaTime) => {
    // makeBezierSplineCurve with friction and air resistance
    setSimulationState(
      evaluateMotionByForwardDirectionWithFriction(
        simulationState,
        getForwardDirectionAtDistance(points[0], points[1], simulationState.distanceTraveled),
        simulationState.friction,
        simulationState.airResistance,
        simulationState.gravity,
        deltaTime,
      ),
    );

    // makeBezierSplineCurve without energy loss
    setSimulationStateWithoutFriction(
      evaluateMotionByForwardDirection(
        simulationStateWithoutFriction,
        getForwardDirectionAtDistance(
          points[0],
          points[1],
          simulationStateWithoutFriction.distanceTraveled,
        ),
        simulationState.gravity,
        deltaTime,
      ),
    );
  });

  // Reset simulation state if train overshoots track
  useEffect(() => {
    if (
      simulationState.distanceTraveled > length(points[0], points[1]) ||
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

  const trainPosition = getPositionAtDistance(
    points[0],
    points[1],
    MathUtils.clamp(simulationState.distanceTraveled, 0, length(points[0], points[1])),
  );

  const trainPositionWithoutFriction = getPositionAtDistance(
    points[0],
    points[1],
    MathUtils.clamp(
      simulationStateWithoutFriction.distanceTraveled,
      0,
      length(points[0], points[1]),
    ),
  );

  return (
    <>
      <DragControlPoints axisLock="z" points={points} setPoints={setPoints} />
      <Line points={points} color={colors.secondary} />

      <ControlPoint position={trainPosition} color={colors.highlight} />
      <ControlPoint position={trainPositionWithoutFriction} />
    </>
  );
};

export const FrictionAndAirResistanceScene = () => {
  return (
    <OrthographicScene>
      <FrictionAndAirResistance />
    </OrthographicScene>
  );
};
