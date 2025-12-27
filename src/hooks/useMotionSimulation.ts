import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';

import { CurveNode, length, matrixAtDistance } from '../maths/curve';
import { evaluateMotion } from '../helper/physics';

import { useSimulationStateControls } from './useSimulationStateControls';

export const useMotionSimulation = (curve: CurveNode[]) => {
  const [simulationState, setSimulationState] =
    useSimulationStateControls();

  useFrame((_, deltaTime) => {
    setSimulationState(
      evaluateMotion(
        simulationState,
        matrixAtDistance(curve, simulationState.distanceTraveled),
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
      simulationState.distanceTraveled > length(curve) ||
      simulationState.distanceTraveled < 0
    ) {
      setSimulationState({
        velocity: 0,
        distanceTraveled: 0,
        acceleration: 0,
      });
    }
  }, [simulationState.distanceTraveled, setSimulationState, curve]);

  return useMemo(
    () =>
      matrixAtDistance(
        curve,
        MathUtils.clamp(
          simulationState.distanceTraveled,
          0,
          length(curve),
        ),
      ),
    [curve, simulationState.distanceTraveled],
  );
};
