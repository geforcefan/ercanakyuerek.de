import React, { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { useDevicePixelRatio } from 'use-device-pixel-ratio';

import useColors from '../hooks/useColors';
import { CanvasProps } from '@react-three/fiber/dist/declarations/src/web/Canvas';

const OrthographicScene = (props: { children?: ReactNode } & CanvasProps) => {
  const { children, ...restProps } = props;
  const colors = useColors();
  const dpr = useDevicePixelRatio();

  return (
    <Canvas orthographic camera={{ zoom: 30 }} dpr={dpr} {...restProps}>
      <color attach="background" args={[colors.primary]} />
      {children}
    </Canvas>
  );
};

export default OrthographicScene;
