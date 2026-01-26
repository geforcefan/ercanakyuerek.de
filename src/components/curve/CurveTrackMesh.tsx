import React, { FunctionComponent, useMemo } from 'react';
import {
  BufferAttribute,
  BufferGeometry,
  MeshStandardMaterial,
  Vector2,
  Vector3,
} from 'three';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader';

import {
  Curve,
  totalArcLength,
  transformationAtArcLength,
} from '../../maths/curve';
import { uniformSampleMap } from '../../helper/uniform-sample';
import { useColors } from '../../hooks/useColors';

import Tie from '../../experiments/tie.3ds';

const tie = await new TDSLoader().loadAsync(Tie);

export const sweep = (
  shapes: Vector2[][],
  curve: Curve,
  spacing: number,
) => {
  const from = 0;
  const to = totalArcLength(curve);
  const length = to - from;

  const numberOfNodes = Math.max(Math.ceil(length / spacing) + 1, 2);

  let totalShapePoints = 0;
  for (const shape of shapes) {
    totalShapePoints += shape.length;
  }

  const positions = new Float32Array(
    numberOfNodes * totalShapePoints * 3,
  );
  const indices = new Uint32Array(
    (numberOfNodes - 1) * totalShapePoints * 6,
  );

  let p = 0;
  let i = 0;

  for (let r = 0; r < numberOfNodes; r++) {
    const t = r / (numberOfNodes - 1);
    const at = from + t * length;
    const matrix = transformationAtArcLength(curve, at);

    const currentShape = r * totalShapePoints;
    const previousShape = (r - 1) * totalShapePoints;

    let shapeOffset = 0;

    for (const shape of shapes) {
      for (let s = 0; s < shape.length; s++) {
        const v = shape[s];
        const v3 = new Vector3(v.x, v.y, 0).applyMatrix4(matrix);

        positions[p++] = v3.x;
        positions[p++] = v3.y;
        positions[p++] = v3.z;

        if (r > 0) {
          const s1 = (s + 1) % shape.length;

          const a = previousShape + shapeOffset + s;
          const b = currentShape + shapeOffset + s;
          const a1 = previousShape + shapeOffset + s1;
          const b1 = currentShape + shapeOffset + s1;

          indices[i++] = a;
          indices[i++] = b1;
          indices[i++] = b;

          indices[i++] = a;
          indices[i++] = a1;
          indices[i++] = b1;
        }
      }

      shapeOffset += shape.length;
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute(
    'position',
    new BufferAttribute(positions, 3),
  );
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.computeVertexNormals();

  return geometry;
};

export const makeCircleShape = (
  radius: number,
  segments: number,
  offset: Vector2 = new Vector2(0, 0),
): Vector2[] => {
  const points: Vector2[] = [];

  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    points.push(
      new Vector2(
        Math.cos(t) * radius + offset.x,
        Math.sin(t) * radius + offset.y,
      ),
    );
  }

  return points;
};

export const makeRectangleShape = (
  width: number,
  height: number,
  offset: Vector2 = new Vector2(0, 0),
): Vector2[] => {
  const hw = width / 2;
  const hh = height / 2;

  return [
    new Vector2(-hw + offset.x, -hh + offset.y),
    new Vector2(hw + offset.x, -hh + offset.y),
    new Vector2(hw + offset.x, hh + offset.y),
    new Vector2(-hw + offset.x, hh + offset.y),
  ];
};

export const CurveTrackMesh: FunctionComponent<{
  curve: Curve;
}> = ({ curve }) => {
  const colors = useColors();

  const { rails } = useMemo(() => {
    return {
      rails: sweep(
        [
          makeCircleShape(0.07, 8, new Vector2(-0.45, 0)),
          makeCircleShape(0.07, 8, new Vector2(0.45, 0)),
          makeCircleShape(0.2, 8, new Vector2(0, -0.4)),
        ],
        curve,
        0.1,
      ),
    };
  }, [curve]);

  const ties = useMemo(
    () =>
      uniformSampleMap(0, totalArcLength(curve), 1.25, (at) => {
        const tieClone = tie.clone();

        tieClone.traverse((child) => {
          (child as any).material = new MeshStandardMaterial({
            color: colors.highlight,
          });
        });

        return (
          <group
            key={at}
            matrix={transformationAtArcLength(curve, at)}
            matrixAutoUpdate={false}
          >
            <group
              scale={[0.0254, 0.0254, 0.0254]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <primitive object={tieClone}>
                <meshStandardMaterial color={colors.highlight} />
              </primitive>
            </group>
          </group>
        );
      }),
    [curve, colors.highlight],
  );

  return (
    <>
      {ties}
      <mesh geometry={rails}>
        <meshStandardMaterial color={colors.highlight} />
      </mesh>
    </>
  );
};
