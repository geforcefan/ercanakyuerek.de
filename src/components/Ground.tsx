import React from 'react';
import { ThreeElements } from '@react-three/fiber';

import { useColors } from '../hooks/useColors';

export const Ground = (props: ThreeElements['group']) => {
  const colors = useColors();

  return (
    <group position={[0, -1, 0]} {...props}>
      <mesh receiveShadow={true} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial color={colors.silent} />
      </mesh>
    </group>
  );
};
