import React, { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { useDevicePixelRatio } from 'use-device-pixel-ratio';

import { useColors } from '../../hooks/useColors';

import { PerspectiveCameraControls } from '../camera/PerspectiveCameraControls';

export const PerspectiveScene = ({
  children,
  withCameraControls = true,
}: {
  children?: ReactNode;
  withCameraControls?: boolean;
}) => {
  const colors = useColors();
  const dpr = useDevicePixelRatio();

  return (
    <Canvas dpr={dpr}>
      {withCameraControls && <PerspectiveCameraControls />}
      <color attach="background" args={[colors.primary]} />
      {children}
    </Canvas>
  );
};
