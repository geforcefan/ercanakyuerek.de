import React, { ReactNode } from 'react';
import { CanvasProps } from '@react-three/fiber/dist/declarations/src/web/Canvas';

import {
  CameraView,
  CameraViewManager,
} from '../camera/CameraViewManager';
import { OrthographicEditor } from '../editor/OrthographicEditor';
import { PerspectiveEditor } from '../editor/PerspectiveEditor';
import { DefaultCanvas } from './DefaultCanvas';

export const EditorScene = ({
  children,
}: {
  children?: ReactNode;
} & CanvasProps) => {
  return (
    <CameraViewManager>
      <DefaultCanvas>
        {['front', 'back', 'top', 'bottom', 'left', 'right'].map(
          (view) => (
            <CameraView
              key={view}
              name={view}
              makeDefault={view === 'front'}
            >
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
