import React, { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { Vector3 } from 'three';

import { ControlPoint } from '../components/ControlPoint';
import { DragControlPosition } from '../components/DragControlPosition';
import Line from '../components/Line';
import Scene from '../components/Scene';
import { getForwardDirectionAtDistance, getPositionAtDistance, length } from '../helper/linear';
import { evaluateMotionByForwardDirection } from '../helper/physics';
import useColors from '../hooks/useColors';

const Demo = () => {
  const colors = useColors();

  // Control points
  const [cp1, setCp1] = useState(new Vector3(-11.5, 3.2, 0));
  const [cp2, setCp2] = useState(new Vector3(1.4, -2.8, 0));

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
        getForwardDirectionAtDistance(cp1, cp2, simulationState.distanceTraveled),
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
    }
  }, [simulationState.distanceTraveled]);

  const trainPosition = getPositionAtDistance(cp1, cp2, simulationState.distanceTraveled);

  return (
    <>
      <DragControlPosition axisLock="z" position={cp1} onDrag={setCp1}>
        <ControlPoint />
      </DragControlPosition>

      <DragControlPosition axisLock="z" position={cp2} onDrag={setCp2}>
        <ControlPoint />
      </DragControlPosition>

      <Line points={[cp1, cp2]} color={colors.secondary} />

      <ControlPoint position={trainPosition} color={colors.highlight} />
    </>
  );
};

export const DemoLinearTrackScene = () => {
  return (
    <Scene>
      <Demo />
    </Scene>
  );
};
