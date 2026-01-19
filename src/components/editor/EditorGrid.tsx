import React from 'react';
import { ThreeElements } from '@react-three/fiber';

import { useColors } from '../../hooks/useColors';

export const EditorGrid = ({
  ...props
}: { size?: number } & ThreeElements['group']) => {
  const colors = useColors();

  return (
    <group {...props}>
      <gridHelper args={[1000, 1000, colors.silent, colors.silent]} />
      <gridHelper
        args={[1000, 100, colors.secondary, colors.secondary]}
      />
      <gridHelper
        args={[1000, 10, colors.secondary, colors.secondary]}
      />
    </group>
  );
};
