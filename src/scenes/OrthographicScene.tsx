import React, { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { CanvasProps } from '@react-three/fiber/dist/declarations/src/web/Canvas';
import { useDevicePixelRatio } from 'use-device-pixel-ratio';

import { useColors } from '../hooks/useColors';

import { SplineEditorCameraControls } from '../components/camera/SplineEditorCameraControls';

export const OrthographicScene = ({
  cameraControlsActive = true, ...props
}: {
  children?: ReactNode;
  cameraControlsActive?: boolean;
} & CanvasProps) => {
  const { children, ...restProps } = props;
  const colors = useColors();
  const dpr = useDevicePixelRatio();

  return (
    <Canvas
      orthographic
      camera={{ zoom: 30 }}
      dpr={dpr}
      {...restProps}
    >
      {cameraControlsActive && <SplineEditorCameraControls />}
      <color attach="background" args={[colors.primary]} />
      {children}
    </Canvas>
  );
};
