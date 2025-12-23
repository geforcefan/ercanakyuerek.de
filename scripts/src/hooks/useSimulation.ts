import { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

import {
  CurveNode,
  length,
  matrixAtDistanceWithoutTransition,
} from '../maths/curve';
import { evaluateMotionByMatrixWithEnergyLoss } from '../helper/physics';

import { useSimulationStateControls } from './useSimulationStateControls';

export const useSimulation = (curve: CurveNode[]) => {
  const [simulationState, setSimulationState] =
    useSimulationStateControls();

  useFrame((state, deltaTime) => {
    setSimulationState(
      evaluateMotionByMatrixWithEnergyLoss(
        simulationState,
        matrixAtDistanceWithoutTransition(
          curve,
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

  return simulationState;
};
