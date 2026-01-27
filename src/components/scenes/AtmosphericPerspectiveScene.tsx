import React, { ReactNode } from 'react';
import { Sky } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useDevicePixelRatio } from 'use-device-pixel-ratio';

import {
  CameraView,
  CameraViewManager,
} from '../camera/CameraViewManager';
import { PerspectiveEditor } from '../editor/PerspectiveEditor';

const sunPosition = new Vector3(50, 50, 0);

export const AtmosphericPerspectiveScene = ({
  children,
}: {
  children?: ReactNode;
}) => {
  const dpr = useDevicePixelRatio();
  return (
    <CameraViewManager>
      <Canvas dpr={dpr} shadows={true}>
        <Sky sunPosition={sunPosition} />
        <ambientLight castShadow={true} intensity={1} />
        <directionalLight
          castShadow
          position={sunPosition}
          intensity={1}
          shadow-mapSize-width={2048 * 4}
          shadow-mapSize-height={2048 * 4}
          shadow-camera-near={1}
          shadow-camera-far={400}
          shadow-camera-left={-400}
          shadow-camera-right={400}
          shadow-camera-top={400}
          shadow-camera-bottom={-400}
        />

        <CameraView name="perspective" makeDefault={true}>
          <PerspectiveEditor />
        </CameraView>
        {children}
      </Canvas>
    </CameraViewManager>
  );
};
