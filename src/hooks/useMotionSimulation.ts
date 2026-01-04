import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';

import { CurveNode, totalArcLength, matrixAtArcLength } from '../maths/curve';
import { evaluateMotion } from '../helper/physics';

import { useSimulationStateControls } from './useSimulationStateControls';

export const useMotionSimulation = (
  curve: CurveNode[],
  init: Parameters<typeof useSimulationStateControls>[0] = {},
) => {
  const [simulationState, setSimulationState] =
    useSimulationStateControls(init);

  useFrame((_, deltaTime) => {
    setSimulationState(
      evaluateMotion(
        simulationState,
        matrixAtArcLength(curve, simulationState.distanceTraveled),
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
      simulationState.distanceTraveled > totalArcLength(curve) ||
      simulationState.distanceTraveled < 0
    ) {
      setSimulationState({
        velocity: init?.velocity ?? 0,
        distanceTraveled: init?.distanceTraveled ?? 0,
        acceleration: 0,
      });
    }
  }, [
    simulationState.distanceTraveled,
    setSimulationState,
    curve,
    init?.velocity,
    init?.distanceTraveled,
  ]);

  return useMemo(
    () =>
      matrixAtArcLength(
        curve,
        MathUtils.clamp(
          simulationState.distanceTraveled,
          0,
          totalArcLength(curve),
        ),
      ),
    [curve, simulationState.distanceTraveled],
  );
};
