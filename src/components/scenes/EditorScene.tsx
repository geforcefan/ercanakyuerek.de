import React, { ReactNode } from 'react';
import { CanvasProps } from '@react-three/fiber/dist/declarations/src/web/Canvas';
import { Vector3 } from 'three';

import {
  CameraView,
  CameraViewManager,
} from '../camera/CameraViewManager';
import { OrthographicEditor } from '../editor/OrthographicEditor';
import { PerspectiveEditor } from '../editor/PerspectiveEditor';
import { DefaultCanvas } from './DefaultCanvas';

export const EditorScene = ({
  boundary = new Vector3(500, 500, 500),
  children,
}: {
  children?: ReactNode;
  boundary?: Vector3;
} & CanvasProps) => {
  return (
    <CameraViewManager>
      <DefaultCanvas>
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
      </DefaultCanvas>
    </CameraViewManager>
  );
};
