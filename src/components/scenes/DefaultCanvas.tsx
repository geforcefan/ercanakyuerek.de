import React, { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { useDevicePixelRatio } from 'use-device-pixel-ratio';

import { useColors } from '../../hooks/useColors';

export const DefaultCanvas = ({
  children,
}: {
  children?: ReactNode;
}) => {
  const colors = useColors();
  const dpr = useDevicePixelRatio();

  return (
    <Canvas dpr={dpr}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <color attach="background" args={[colors.primary]} />
      {children}
    </Canvas>
  );
};
