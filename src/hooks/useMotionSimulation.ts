import { useEffect, useMemo, useState } from 'react';
import { useControls } from 'leva';
import { MathUtils } from 'three';

import {
  Curve,
  totalArcLength,
  transformationAtArcLength,
} from '../maths/curve';
import { evaluateMotion } from '../helper/physics';

import { useSimulationStateControls } from './useSimulationStateControls';

export const useMotionSimulation = (
  curve: Curve,
  init: Parameters<typeof useSimulationStateControls>[0] = {},
) => {
  const [
    { friction, airResistance, gravity, simulationSpeed },
    setSimulationConstants,
  ] = useControls('Simulation', () => ({
    friction: {
      value: init.friction ?? 0.03,
      pad: 5,
    },
    airResistance: {
      value: init.airResistance ?? 2e-5,
      pad: 6,
    },
    gravity: {
      value: init.gravity ?? 9.81665,
      pad: 5,
    },
    simulationSpeed: {
      min: 0.25,
      max: 4,
      step: 0.25,
      value: init.simulationSpeed ?? 1,
    },
    distanceTraveled: {
      value: 0,
      disabled: true,
    },
    velocity: {
      value: 0,
      disabled: true,
    },
    acceleration: {
      value: 0,
      pad: 5,
      disabled: true,
    },
  }));

  const [simulationState, setSimulationState] = useState({
    distanceTraveled: init?.distanceTraveled ?? 0,
    velocity: init?.velocity ?? 0,
    acceleration: 0,
  });

  useEffect(() => {
    setSimulationConstants({ ...simulationState });
  }, [setSimulationConstants, simulationState]);

  useEffect(() => {
    let timeoutId: number;
    let lastTime = performance.now();

    const tick = () => {
      const now = performance.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      if (deltaTime > 0.032 || !deltaTime) {
        timeoutId = window.setTimeout(tick, 8);
        return;
      }

      setSimulationState((prev) =>
        evaluateMotion(
          prev,
          transformationAtArcLength(curve, prev.distanceTraveled),
          friction,
          airResistance,
          gravity,
          deltaTime * simulationSpeed,
        ),
      );

      timeoutId = window.setTimeout(tick, 8);
    };

    timeoutId = window.setTimeout(tick, 8);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [curve, simulationSpeed, gravity, airResistance, friction]);

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
      transformationAtArcLength(
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
