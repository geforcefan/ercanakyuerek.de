import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
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
    maxDeltaTime?: number;
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
    maxDeltaTime = 0.08,
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

  useFrame((_, deltaTime) => {
    if (!deltaTime || deltaTime > 1) return;

    let deltaLeft = deltaTime;

    while (deltaLeft > 0) {
      const accumulatorDeltaTime = Math.min(maxDeltaTime, deltaLeft);
      deltaLeft -= maxDeltaTime;

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

        let activeAcceleration = 0;

        if (
          section &&
          section.maxVelocity !== undefined &&
          simulationState.current.velocity < section.maxVelocity
        )
          activeAcceleration = section.acceleration;
        if (
          section &&
          section.minVelocity !== undefined &&
          simulationState.current.velocity > section.minVelocity
        )
          activeAcceleration = section.acceleration;

        simulationState.current = evaluateMotion(
          simulationState.current,
          transformationAtArcLength(
            curve,
            simulationState.current.distanceTraveled,
          ),
          activeAcceleration,
          friction,
          airResistance,
          gravity,
          accumulatorDeltaTime * simulationSpeed,
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
    }
  });

  return matrix;
};
