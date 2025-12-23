import React, { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { useDevicePixelRatio } from 'use-device-pixel-ratio';

import { useColors } from '../hooks/useColors';

export const PerspectiveScene = ({
  children,
}: {
  children?: ReactNode;
}) => {
  const colors = useColors();
  const dpr = useDevicePixelRatio();

  return (
    <Canvas dpr={dpr}>
      <color attach="background" args={[colors.primary]} />
      {children}
    </Canvas>
  );
};
