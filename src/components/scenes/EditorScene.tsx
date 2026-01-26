import React, { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { CanvasProps } from '@react-three/fiber/dist/declarations/src/web/Canvas';
import { Vector3 } from 'three';
import { useDevicePixelRatio } from 'use-device-pixel-ratio';

import { useColors } from '../../hooks/useColors';

import {
  CameraView,
  CameraViewManager,
} from '../camera/CameraViewManager';
import { OrthographicEditor } from '../editor/OrthographicEditor';
import { PerspectiveEditor } from '../editor/PerspectiveEditor';

export const EditorScene = ({
  boundary = new Vector3(500, 500, 500),
  children,
  ...props
}: {
  children?: ReactNode;
  boundary?: Vector3;
} & CanvasProps) => {
  const colors = useColors();
  const dpr = useDevicePixelRatio();

  return (
    <CameraViewManager>
      <Canvas dpr={dpr} {...props}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />

        {['front', 'back', 'top', 'bottom', 'left', 'right'].map(
          (view) => (
            <CameraView name={view} makeDefault={view === 'front'}>
              <OrthographicEditor view={view as any} />
            </CameraView>
          ),
        )}
        <CameraView name="perspective">
          <PerspectiveEditor />
        </CameraView>
        {children}
        <color attach="background" args={[colors.primary]} />
      </Canvas>
    </CameraViewManager>
  );
};
