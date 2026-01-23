import React from 'react';
import {
  CameraControls,
  CameraControlsImpl,
} from '@react-three/drei';
import { CameraControlsProps } from '@react-three/drei/core/CameraControls';

export const PerspectiveCameraControls = (
  props: CameraControlsProps,
) => {
  return (
    <CameraControls
      dollyToCursor={true}
      draggingSmoothTime={0.03}
      dollySpeed={0.4}
      infinityDolly={true}
      dollyDragInverted={true}
      minDistance={0}
      maxDistance={Infinity}
      mouseButtons={{
        left: CameraControlsImpl.ACTION.ROTATE,
        right: CameraControlsImpl.ACTION.TRUCK,
        wheel: CameraControlsImpl.ACTION.DOLLY,
        middle: CameraControlsImpl.ACTION.NONE,
      }}
      {...props}
    />
  );
};
