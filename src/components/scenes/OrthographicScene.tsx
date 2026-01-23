import React, { ReactNode } from 'react';
import { OrthographicCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { CanvasProps } from '@react-three/fiber/dist/declarations/src/web/Canvas';
import { useDevicePixelRatio } from 'use-device-pixel-ratio';

import { useColors } from '../../hooks/useColors';

export const OrthographicScene = ({
  withCameraControls = true,
  ...props
}: {
  children?: ReactNode;
  withCameraControls?: boolean;
} & CanvasProps) => {
  const { children, ...restProps } = props;
  const colors = useColors();
  const dpr = useDevicePixelRatio();

  return (
    <Canvas dpr={dpr} {...restProps}>
      <OrthographicCamera
        makeDefault={true}
        zoom={30}
        position={[0, 0, 500]}
        up={[0, 0, 0]}
      />
      <color attach="background" args={[colors.primary]} />
      {children}
    </Canvas>
  );
};
