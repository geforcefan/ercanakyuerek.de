import React, { useEffect } from 'react';
import { useControls } from 'leva';
import { MathUtils, Vector3 } from 'three';

import Line from '../components/Line';
import Scene from '../components/Scene';
import useColors from '../hooks/useColors';

const Demo = () => {
  const colors = useColors();
  const lineLength = 8;

  const [{ slope, gravity }, setState] = useControls(() => ({
    slope: {
      value: 0,
      step: 5,
      min: -180,
      max: 180,
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
    acceleration: {
      disabled: true,
      value: 9.81665,
      pad: 5,
    },
  }));

  useEffect(() => {
    const sinSlope = Math.sin(MathUtils.degToRad(slope));
    const acceleration = gravity * sinSlope;

    setState({ acceleration, sinSlope });
  }, [slope, gravity, setState]);

  return (
    <>
      <group position={[-5, 0, 0]} rotation={[0, 0, MathUtils.degToRad(slope)]}>
        <mesh position={[-lineLength / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.3, 0.5, 5]}>
            <meshStandardMaterial color={colors.secondary} />
          </coneGeometry>
        </mesh>

        <Line
          points={[new Vector3(-lineLength / 2, 0, 0), new Vector3(lineLength / 2, 0, 0)]}
          color={colors.secondary}
        />
      </group>
    </>
  );
};

export const DemoGravity = () => {
  return (
    <Scene>
      <Demo />
    </Scene>
  );
};
