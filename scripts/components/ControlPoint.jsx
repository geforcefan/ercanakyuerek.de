import React from 'react';

import useColors from '../hooks/useColors';

const sizes = {
  sm: '0.1',
  md: '0.2',
};

export const ControlPoint = ({ size = 'md', color, ...props }) => {
  const colors = useColors();

  return (
    <mesh {...props}>
      <sphereGeometry args={[sizes[size], 6, 6]} />
      <meshBasicMaterial color={color || colors.secondary} />
    </mesh>
  );
};
