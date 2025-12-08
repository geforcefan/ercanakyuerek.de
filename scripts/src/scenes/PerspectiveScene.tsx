import React, { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { useDevicePixelRatio } from 'use-device-pixel-ratio';

import useColors from '../hooks/useColors';

const PerspectiveScene = ({ children }: { children?: ReactNode }) => {
  const colors = useColors();
  const dpr = useDevicePixelRatio();

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      <Canvas dpr={dpr}>
        <color attach="background" args={[colors.primary]} />
        {children}
      </Canvas>
    </div>
  );
};

export default PerspectiveScene;
