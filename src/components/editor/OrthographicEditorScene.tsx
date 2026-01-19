import React, { ReactNode, useMemo } from 'react';
import {
  CameraControls,
  CameraControlsImpl,
  OrthographicCamera,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { CanvasProps } from '@react-three/fiber/dist/declarations/src/web/Canvas';
import { Euler, Vector3 } from 'three';
import { useDevicePixelRatio } from 'use-device-pixel-ratio';

import { useColors } from '../../hooks/useColors';

import { EditorGrid } from './EditorGrid';

export const OrthographicEditorScene = ({
  view = 'back',
  boundary = new Vector3(500, 500, 500),
  ...props
}: {
  children?: ReactNode;
  boundary?: Vector3;
  view?: 'top' | 'bottom' | 'front' | 'back' | 'left' | 'right';
} & CanvasProps) => {
  const { children, ...restProps } = props;
  const colors = useColors();
  const dpr = useDevicePixelRatio();

  const viewValues = useMemo(() => {
    return {
      front: {
        cameraPosition: new Vector3(0, 0, 500),
        cameraUp: new Vector3(0, 0, 1),
        gridRotation: new Euler(Math.PI / 2, 0, 0),
      },
      back: {
        cameraPosition: new Vector3(0, 0, -500),
        cameraUp: new Vector3(0, 0, 1),
        gridRotation: new Euler(Math.PI / 2, 0, 0),
      },
      top: {
        cameraPosition: new Vector3(0, 500, 0),
        cameraUp: new Vector3(0, 1, 0),
        gridRotation: new Euler(0, Math.PI / 2, 0),
      },
      bottom: {
        cameraPosition: new Vector3(0, -500, 0),
        cameraUp: new Vector3(0, 1, 0),
        gridRotation: new Euler(0, Math.PI / 2, 0),
      },
      left: {
        cameraPosition: new Vector3(500, 0, 0),
        cameraUp: new Vector3(1, 0, 0),
        gridRotation: new Euler(0, 0, Math.PI / 2),
      },
      right: {
        cameraPosition: new Vector3(-500, 0, 0),
        cameraUp: new Vector3(1, 0, 0),
        gridRotation: new Euler(0, 0, Math.PI / 2),
      },
    }[view];
  }, [view])!;

  return (
    <Canvas dpr={dpr} {...restProps}>
      <OrthographicCamera
        key={view}
        makeDefault={true}
        zoom={30}
        position={viewValues.cameraPosition}
        up={viewValues.cameraUp}
      />
      <EditorGrid rotation={viewValues.gridRotation} />
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
      />
      <color attach="background" args={[colors.primary]} />
      {children}
    </Canvas>
  );
};
