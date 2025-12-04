import React, { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { MathUtils, Vector3 } from 'three';

import { ControlPoint } from '../components/ControlPoint';
import { DragControlPosition } from '../components/DragControlPosition';
import Line from '../components/Line';
import Scene from '../components/Scene';
import { getForwardDirectionAtDistance, getPositionAtDistance, length } from '../helper/linear';
import {
  evaluateMotionByForwardDirection,
  evaluateMotionByForwardDirectionWithFriction,
} from '../helper/physics';
import useColors from '../hooks/useColors';

const Demo = () => {
  const colors = useColors();

  // Control points
  const [cp1, setCp1] = useState(new Vector3(-11.5, 3.2, 0));
  const [cp2, setCp2] = useState(new Vector3(1.4, -2.8, 0));

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
  }));

  // Main motion evaluation per frame
  useFrame((state, deltaTime) => {
    // evaluate with friction and air resistance
    setSimulationState(
      evaluateMotionByForwardDirectionWithFriction(
        simulationState,
        getForwardDirectionAtDistance(cp1, cp2, simulationState.distanceTraveled),
        simulationState.friction,
        simulationState.airResistance,
        simulationState.gravity,
        deltaTime,
      ),
    );

    // evaluate without energy loss
    setSimulationStateWithoutFriction(
      evaluateMotionByForwardDirection(
        simulationStateWithoutFriction,
        getForwardDirectionAtDistance(cp1, cp2, simulationStateWithoutFriction.distanceTraveled),
        simulationState.gravity,
        deltaTime,
      ),
    );
  });

  // Reset simulation state if train overshoots track
  useEffect(() => {
    if (
      simulationState.distanceTraveled > length(cp1, cp2) ||
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
      });
    }
  }, [simulationState.distanceTraveled]);

  const trainPosition = getPositionAtDistance(
    cp1,
    cp2,
    MathUtils.clamp(simulationState.distanceTraveled, 0, length(cp1, cp2)),
  );

  const trainPositionWithoutFriction = getPositionAtDistance(
    cp1,
    cp2,
    MathUtils.clamp(simulationStateWithoutFriction.distanceTraveled, 0, length(cp1, cp2)),
  );

  return (
    <>
      <DragControlPosition axisLock="z" position={cp1} onDrag={setCp1}>
        <ControlPoint />
      </DragControlPosition>

      <DragControlPosition axisLock="z" position={cp2} onDrag={setCp2}>
        <ControlPoint />
      </DragControlPosition>

      <Line points={[cp1, cp2]} color={colors.secondary} lineWidth={0.02} />

      <ControlPoint position={trainPosition} color={colors.highlight} />
      <ControlPoint position={trainPositionWithoutFriction} />
    </>
  );
};

export const DemoLinearTrackSceneWithFriction = () => {
  return (
    <Scene>
      <Demo />
    </Scene>
  );
};
