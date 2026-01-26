import { BufferGeometry, Matrix4, Mesh, Object3D } from 'three';

export const bufferGeometriesFromObject3D = (
  object: Object3D,
  extraTransform: Matrix4 = new Matrix4(),
) => {
  const geometries: BufferGeometry[] = [];

  object.updateWorldMatrix(true, true);

  object.traverse((child) => {
    if ((child as any).isMesh) {
      const mesh = child as Mesh;
      const geom = mesh.geometry.clone();
      geom.applyMatrix4(mesh.matrixWorld);
      geom.applyMatrix4(extraTransform);
      geometries.push(geom);
    }
  });

  return geometries;
};
