import React, { FunctionComponent, useMemo } from 'react';
import * as THREE from 'three';
import { MeshStandardMaterial, Vector2 } from 'three';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader';

import {
  Curve,
  totalArcLength,
  transformationAtArcLength,
} from '../../maths/curve';
import { sweep } from '../../maths/geometries';
import { makeCircleShape } from '../../maths/shapes';
import { bufferGeometriesFromObject3D } from '../../helper/three';
import { uniformSampleMap } from '../../helper/uniform-sample';
import { useColors } from '../../hooks/useColors';

import Tie from '../../experiments/tie.3ds';

const tieGeometries = bufferGeometriesFromObject3D(
  await new TDSLoader().loadAsync(Tie),
  new THREE.Matrix4()
    .makeRotationX(-Math.PI / 2)
    .multiply(new THREE.Matrix4().makeScale(0.0254, 0.0254, 0.0254)),
);

export const CurveTrackMesh: FunctionComponent<{ curve: Curve }> = ({
  curve,
}) => {
  const colors = useColors();

  const rails = useMemo(
    () =>
      sweep(
        [
          makeCircleShape(0.07, 8, new Vector2(-0.45, 0)),
          makeCircleShape(0.07, 8, new Vector2(0.45, 0)),
          makeCircleShape(0.2, 8, new Vector2(0, -0.4)),
        ],
        curve,
        0.1,
      ),
    [curve],
  );

  const tieMaterial = useMemo(
    () => new MeshStandardMaterial({ color: colors.highlight }),
    [colors.highlight],
  );

  const ties = useMemo(() => {
    const matrices = uniformSampleMap(
      0,
      totalArcLength(curve),
      1.25,
      (at) => transformationAtArcLength(curve, at),
    );

    return tieGeometries.map((geometry, gi) => {
      const instanced = new THREE.InstancedMesh(
        geometry,
        tieMaterial,
        matrices.length,
      );

      matrices.forEach((matrix, i) => {
        instanced.setMatrixAt(i, matrix.clone());
      });

      instanced.instanceMatrix.needsUpdate = true;

      return <primitive key={gi} object={instanced} />;
    });
  }, [curve, tieMaterial]);

  return (
    <>
      {ties}
      <mesh geometry={rails}>
        <meshStandardMaterial color={colors.highlight} />
      </mesh>
    </>
  );
};
