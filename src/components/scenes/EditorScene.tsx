import React, { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { CanvasProps } from '@react-three/fiber/dist/declarations/src/web/Canvas';
import { useControls } from 'leva';
import { Vector3 } from 'three';
import { useDevicePixelRatio } from 'use-device-pixel-ratio';

import { useColors } from '../../hooks/useColors';

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

  const { view } = useControls({
    view: {
      value: 'front',
      options: [
        'top',
        'bottom',
        'front',
        'back',
        'left',
        'right',
        'perspective',
      ],
    },
  });

  return (
    <Canvas dpr={dpr} {...props}>
      {view === 'perspective' && <PerspectiveEditor />}
      {view !== 'perspective' && (
        <OrthographicEditor view={view as any} />
      )}
      <color attach="background" args={[colors.primary]} />
      {children}
    </Canvas>
  );
};
