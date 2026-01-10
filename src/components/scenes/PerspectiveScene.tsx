import React, { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { useDevicePixelRatio } from 'use-device-pixel-ratio';

import { useColors } from '../../hooks/useColors';

import { DefaultCameraControls } from '../camera/DefaultCameraControls';

export const PerspectiveScene = ({
  children,
  cameraControlsActive = true,
}: {
  children?: ReactNode;
  cameraControlsActive?: boolean;
}) => {
  const colors = useColors();
  const dpr = useDevicePixelRatio();

  return (
    <Canvas dpr={dpr}>
      {cameraControlsActive && <DefaultCameraControls />}
      <color attach="background" args={[colors.primary]} />
      {children}
    </Canvas>
  );
};
