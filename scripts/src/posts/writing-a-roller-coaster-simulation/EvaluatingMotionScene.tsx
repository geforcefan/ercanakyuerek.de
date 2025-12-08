import React, { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { MathUtils, Vector3 } from 'three';

import { Arrow } from '../../components/Arrow';
import { ControlPoint } from '../../components/ControlPoint';
import Line from '../../components/Line';
import { evaluateMotionByAcceleration } from '../../helper/physics';
import useColors from '../../hooks/useColors';
import OrthographicScene from '../../scenes/OrthographicScene';

const EvaluatingMotion = () => {
  const colors = useColors();

  const [{ slope, gravity, sinSlope, trackLength, ...simulationState }, setSimulationState] =
    useControls(() => ({
      slope: {
        value: 0,
        step: 5,
        min: -180,
        max: 180,
      },
      trackLength: {
        value: 8,
        step: 1,
        min: 0,
        max: 20,
      },
      gravity: {
        value: 9.81665,
        pad: 5,
      },
      sinSlope: {
        disabled: true,
        label: 'sin(slope)',
        pad: 5,
        value: 0,
      },
      velocity: 0,
      distanceTraveled: 0,
      acceleration: {
        value: 0,
        pad: 5,
      },
    }));

  useEffect(() => {
    const sinSlope = Math.sin(MathUtils.degToRad(slope));
    const acceleration = gravity * sinSlope;

    setSimulationState({ acceleration, sinSlope });
  }, [slope, gravity, setSimulationState]);

  // Main motion evaluation per frame
  useFrame((state, deltaTime) => {
    setSimulationState(
      evaluateMotionByAcceleration(simulationState, simulationState.acceleration, deltaTime),
    );
  });

  // Reset simulation state if train overshoots track
  useEffect(() => {
    if (simulationState.distanceTraveled < 0 || simulationState.distanceTraveled > trackLength) {
      setSimulationState({
        velocity: 0,
        distanceTraveled: 0,
      });
    }
  }, [simulationState.distanceTraveled, trackLength, setSimulationState]);

  return (
    <>
      <group position={[-5, 0, 0]} rotation={[0, 0, MathUtils.degToRad(slope)]}>
        <Arrow
          position={[-trackLength / 2, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          color={colors.secondary}
        />

        <ControlPoint
          position={new Vector3(trackLength / 2 - simulationState.distanceTraveled, 0, 0)}
        />

        <Line
          points={[new Vector3(-trackLength / 2, 0, 0), new Vector3(trackLength / 2, 0, 0)]}
          color={colors.secondary}
        />
      </group>
    </>
  );
};

export const EvaluatingMotionScene = () => {
  return (
    <OrthographicScene>
      <EvaluatingMotion />
    </OrthographicScene>
  );
};
