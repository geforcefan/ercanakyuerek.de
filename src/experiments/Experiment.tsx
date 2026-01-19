import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { useControls } from 'leva';
import { Vector3 } from 'three';

import { fromURL } from '../helper/nl2park/nl2park';
import { useColors } from '../hooks/useColors';

import { DefaultCameraControls } from '../components/camera/DefaultCameraControls';
import { CurveWireframe } from '../components/curve/CurveWireframe';
import { DragControlPoints } from '../components/curve/DragControlPoints';
import { Ground } from '../components/Ground';
import { PerspectiveScene } from '../components/scenes/PerspectiveScene';

import { fromVertices } from '../coaster/b-spline-track';
import Park from './Experiment.nl2park';

const park = await fromURL(Park);
const exampleCoaster = park.coaster[0];
const exampleTrack = exampleCoaster?.tracks[0];

export const ExperimentScene = () => {
  const colors = useColors();

  const { pov, closed } = useControls({
    pov: true,
    closed: false,
  });

  const points = useMemo(
    () =>
      exampleTrack?.vertices.map(
        (v) => new Vector3(v.position.x, v.position.y, v.position.z),
      ),
    [],
  );

  const curve = useMemo(() => {
    return fromVertices(exampleTrack?.vertices, closed);
  }, [closed]);

  return (
    <>
      <PerspectiveScene>
        <Ground />
        <DragControlPoints points={points} setPoints={() => {}} />
        <Line points={points} color={colors.secondary} />
        {!pov && <DefaultCameraControls />}
        <CurveWireframe color={colors.secondary} curve={curve} />
      </PerspectiveScene>
    </>
  );
};
