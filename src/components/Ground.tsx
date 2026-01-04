import React from 'react';

import { useColors } from '../hooks/useColors';

export const Ground = () => {
  const colors = useColors();

  return (
    <mesh
      receiveShadow={true}
      position={[0, -1, 0]}
      rotation-x={-Math.PI / 2}
    >
      <planeGeometry args={[1000, 1000]} />
      <meshBasicMaterial color={colors.silent} />
    </mesh>
  );
};
