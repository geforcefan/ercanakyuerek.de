import React, { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { useDevicePixelRatio } from 'use-device-pixel-ratio';

import { useColors } from '../../hooks/useColors';

import {
  CameraView,
  CameraViewManager,
} from '../camera/CameraViewManager';
import { PerspectiveEditor } from '../editor/PerspectiveEditor';

export const PerspectiveScene = ({
  children,
}: {
  children?: ReactNode;
}) => {
  const colors = useColors();
  const dpr = useDevicePixelRatio();

  return (
    <CameraViewManager>
      <Canvas dpr={dpr}>
        <CameraView name="perspective" makeDefault={true}>
          <PerspectiveEditor />
        </CameraView>
        {children}
        <color attach="background" args={[colors.primary]} />
      </Canvas>
    </CameraViewManager>
  );
};
