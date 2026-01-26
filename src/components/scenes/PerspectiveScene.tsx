import React, { ReactNode } from 'react';

import {
  CameraView,
  CameraViewManager,
} from '../camera/CameraViewManager';
import { PerspectiveEditor } from '../editor/PerspectiveEditor';
import { DefaultCanvas } from './DefaultCanvas';

export const PerspectiveScene = ({
  children,
}: {
  children?: ReactNode;
}) => {
  return (
    <CameraViewManager>
      <DefaultCanvas>
        <CameraView name="perspective" makeDefault={true}>
          <PerspectiveEditor />
        </CameraView>
        {children}
      </DefaultCanvas>
    </CameraViewManager>
  );
};
