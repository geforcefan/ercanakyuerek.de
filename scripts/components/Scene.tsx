import React, { ReactElement } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { update } from '@tweenjs/tween.js';
import { useDevicePixelRatio } from 'use-device-pixel-ratio';

import useColors from '../hooks/useColors';

const Tween = () => {
  useFrame(() => {
    update();
  });

  return <></>;
};

const Scene = ({ children }: { children?: ReactElement }) => {
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
      <Canvas orthographic camera={{ zoom: 30 }} dpr={dpr}>
        <Tween />
        <color attach="background" args={[colors.primary]} />
        {children}
      </Canvas>
    </div>
  );
};

export default Scene;
