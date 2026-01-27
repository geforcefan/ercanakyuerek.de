import { useEffect, useRef, useState } from 'react';
import { useControls } from 'leva';
import { find } from 'lodash';
import { MathUtils, Matrix4 } from 'three';

import {
  Curve,
  totalArcLength,
  transformationAtArcLength,
} from '../maths/curve';
import { evaluateMotion } from '../helper/physics';

import { useSimulationStateControls } from './useSimulationStateControls';

export const useMotionSimulation = (
  curve: Curve,
  options: {
    init?: Parameters<typeof useSimulationStateControls>[0];
    resetWhenReachedLimit?: boolean;
    sections?: Array<{
      acceleration: number;
      fromArcLength: number;
      toArcLength: number;
      minVelocity?: number;
      maxVelocity?: number;
    }>;
  } = {},
) => {
  const {
    init = {},
    resetWhenReachedLimit = true,
    sections = [],
  } = options;
  const [matrix, setMatrix] = useState(new Matrix4());
  const [{ friction, airResistance, gravity, simulationSpeed }] =
    useControls('Simulation', () => ({
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
    }));

  const simulationState = useRef({
    distanceTraveled: init?.distanceTraveled ?? 0,
    velocity: init?.velocity ?? 0,
    acceleration: 0,
  });

  useEffect(() => {
    let timeoutId: number;
    let lastTime = performance.now();

    const tick = () => {
      const now = performance.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      if (deltaTime > 0.032 || !deltaTime) {
        timeoutId = window.setTimeout(tick);
        return;
      }

      if (
        resetWhenReachedLimit &&
        (simulationState.current.distanceTraveled >
          totalArcLength(curve) ||
          simulationState.current.distanceTraveled < 0)
      ) {
        simulationState.current = {
          velocity: init?.velocity ?? 0,
          distanceTraveled: init?.distanceTraveled ?? 0,
          acceleration: 0,
        };
      } else {
        const section = find(
          sections,
          (s) =>
            simulationState.current.distanceTraveled >=
              s.fromArcLength &&
            simulationState.current.distanceTraveled <= s.toArcLength,
        );

        let acceleration = 0;
        if (
          section &&
          section.maxVelocity !== undefined &&
          simulationState.current.velocity < section.maxVelocity
        )
          acceleration = section.acceleration;
        if (
          section &&
          section.minVelocity !== undefined &&
          simulationState.current.velocity > section.minVelocity
        )
          acceleration = section.acceleration;

        simulationState.current = evaluateMotion(
          simulationState.current,
          transformationAtArcLength(
            curve,
            simulationState.current.distanceTraveled,
          ),
          acceleration,
          friction,
          airResistance,
          gravity,
          deltaTime * simulationSpeed,
        );

        const arcLength = totalArcLength(curve);

        if (!resetWhenReachedLimit)
          simulationState.current.distanceTraveled =
            ((simulationState.current.distanceTraveled % arcLength) +
              arcLength) %
            arcLength;
      }

      setMatrix(
        transformationAtArcLength(
          curve,
          MathUtils.clamp(
            simulationState.current.distanceTraveled,
            0,
            totalArcLength(curve),
          ),
        ),
      );

      timeoutId = window.setTimeout(tick);
    };

    tick();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    curve,
    simulationSpeed,
    gravity,
    airResistance,
    friction,
    resetWhenReachedLimit,
    sections,
    init?.distanceTraveled,
    init?.velocity,
  ]);

  return matrix;
};
