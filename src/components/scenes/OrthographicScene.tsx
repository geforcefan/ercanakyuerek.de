import React, { ReactNode } from 'react';
import { OrthographicCamera } from '@react-three/drei';
import { CanvasProps } from '@react-three/fiber/dist/declarations/src/web/Canvas';

import { DefaultCanvas } from './DefaultCanvas';

export const OrthographicScene = ({
  children,
}: {
  children?: ReactNode;
} & CanvasProps) => {
  return (
    <DefaultCanvas>
      <OrthographicCamera
        makeDefault={true}
        zoom={30}
        position={[0, 0, 500]}
        up={[0, 0, 0]}
      />
      {children}
    </DefaultCanvas>
  );
};
