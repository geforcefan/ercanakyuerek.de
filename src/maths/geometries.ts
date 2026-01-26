import {
  BufferAttribute,
  BufferGeometry,
  Vector2,
  Vector3,
} from 'three';

import {
  Curve,
  totalArcLength,
  transformationAtArcLength,
} from './curve';

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
  for (const shape of shapes) totalShapePoints += shape.length;

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
