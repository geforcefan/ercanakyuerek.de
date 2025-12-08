import React, { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { Vector3 } from 'three';

import { ControlPoint } from '../../components/ControlPoint';
import { DragControlPoints } from '../../components/DragControlPoints';
import Line from '../../components/Line';
import { getForwardDirectionAtDistance, getPositionAtDistance, length } from '../../helper/linear';
import { evaluateMotionByForwardDirection } from '../../helper/physics';
import useColors from '../../hooks/useColors';
import OrthographicScene from '../../scenes/OrthographicScene';

const LinearRollerCoasterTrack = () => {
  const colors = useColors();

  // Control points
  const [points, setPoints] = useState([new Vector3(-11.5, 3.2, 0), new Vector3(1.4, -2.8, 0)]);

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

  // Main motion evaluation per frame
  useFrame((state, deltaTime) => {
    setSimulationState(
      evaluateMotionByForwardDirection(
        simulationState,
        getForwardDirectionAtDistance(points[0], points[1], simulationState.distanceTraveled),
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
    }
  }, [simulationState.distanceTraveled, setSimulationState, points]);

  const trainPosition = getPositionAtDistance(
    points[0],
    points[1],
    simulationState.distanceTraveled,
  );

  return (
    <>
      <DragControlPoints axisLock="z" points={points} setPoints={setPoints} />
      <Line points={points} color={colors.secondary} />
      <ControlPoint position={trainPosition} color={colors.highlight} />
    </>
  );
};

export const LinearRollerCoasterTrackScene = () => {
  return (
    <OrthographicScene>
      <LinearRollerCoasterTrack />
    </OrthographicScene>
  );
};
