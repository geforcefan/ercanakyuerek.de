import React from 'react';
import {
  CameraControls,
  CameraControlsImpl,
} from '@react-three/drei';
import { CameraControlsProps } from '@react-three/drei/core/CameraControls';

export const OrthographicCameraControls = (
  props: CameraControlsProps,
) => {
  return (
    <CameraControls
      mouseButtons={{
        left: CameraControlsImpl.ACTION.NONE,
        right: CameraControlsImpl.ACTION.TRUCK,
        wheel: CameraControlsImpl.ACTION.ZOOM,
        middle: CameraControlsImpl.ACTION.NONE,
      }}
      makeDefault
      dollySpeed={0.4}
      dollyToCursor={true}
      draggingSmoothTime={0.03}
      {...props}
    />
  );
};
