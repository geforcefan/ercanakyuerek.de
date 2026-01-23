import React, { useMemo, useState } from 'react';
import { OrthographicCamera } from '@react-three/drei';
import { find } from 'lodash';
import { Euler, Vector3 } from 'three';
import * as THREE from 'three';

import { OrthographicCameraControls } from '../camera/OrthographicCameraControls';
import { EditorGrid } from './EditorGrid';

const views = [
  {
    name: 'front',
    camera: {
      position: new Vector3(0, 0, 500),
      up: new Vector3(0, 0, 1),
    },
    grid: {
      rotation: new Euler(Math.PI / 2, 0, 0),
      position: new Vector3(0, 0, -500),
    },
  },
  {
    name: 'back',
    camera: {
      position: new Vector3(0, 0, -500),
      up: new Vector3(0, 0, 1),
    },
    grid: {
      rotation: new Euler(Math.PI / 2, 0, 0),
      position: new Vector3(0, 0, 500),
    },
  },
  {
    name: 'top',
    camera: {
      position: new Vector3(0, 500, 0),
      up: new Vector3(0, 1, 0),
    },
    grid: {
      rotation: new Euler(0, Math.PI / 2, 0),
      position: new Vector3(0, 0, 0),
    },
  },
  {
    name: 'bottom',
    camera: {
      position: new Vector3(0, -500, 0),
      up: new Vector3(0, 1, 0),
    },
    grid: {
      rotation: new Euler(0, Math.PI / 2, 0),
      position: new Vector3(0, 0, 0),
    },
  },
  {
    name: 'left',
    camera: {
      position: new Vector3(500, 0, 0),
      up: new Vector3(1, 0, 0),
    },
    grid: {
      rotation: new Euler(0, 0, Math.PI / 2),
      position: new Vector3(-500, 0, 0),
    },
  },
  {
    name: 'right',
    camera: {
      position: new Vector3(-500, 0, 0),
      up: new Vector3(1, 0, 0),
    },
    grid: {
      rotation: new Euler(0, 0, Math.PI / 2),
      position: new Vector3(500, 0, 0),
    },
  },
];

export const OrthographicEditor = ({
  view = 'front',
  showGrid = true,
}: {
  view?: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
  showGrid?: boolean;
}) => {
  const [camera, setCamera] =
    useState<THREE.OrthographicCamera | null>();

  const activeView = useMemo(
    () => find(views, { name: view }),
    [view],
  );
  if (!activeView) return null;

  return (
    <>
      <OrthographicCamera
        ref={setCamera}
        key={view}
        makeDefault={true}
        zoom={30}
        {...activeView.camera}
      />
      {camera && <OrthographicCameraControls camera={camera} />}
      {showGrid && <EditorGrid {...activeView.grid} />}
    </>
  );
};
