import React, { useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Easing, Group, Tween } from '@tweenjs/tween.js';
import { Vector3 } from 'three';

import { BezierCurve } from '../../components/BezierCurve';
import { DragControlPoints } from '../../components/DragControlPoints';
import { Line } from '../../components/Line';
import { useColors } from '../../hooks/useColors';
import { OrthographicScene } from '../../scenes/OrthographicScene';

const Example = () => {
  const colors = useColors();

  const [points, setPoints] = useState([
    new Vector3(-3, -3, 0),
    new Vector3(3, -3, 0),
    new Vector3(-3, 3, 0),
    new Vector3(3, 3, 0),
  ]);

  const [motion, setMotion] = useState({
    resolution: 0.5,
    uniform: 0,
  });

  const group = useMemo(() => {
    const group = new Group();

    const animation = { ...motion };

    const denseSplineTween = new Tween(animation, group)
      .to({ resolution: 2.5 }, 1000)
      .easing(Easing.Linear.None)
      .onUpdate(() => setMotion({ ...animation }));

    const uniformSplineTween = new Tween(animation, group)
      .delay(3000)
      .to({ uniform: 1 }, 500)
      .onUpdate(() => setMotion({ ...animation }));

    const resetTween = new Tween(animation, group)
      .delay(2000)
      .to({ uniform: 0, resolution: 0.5 }, 1000)
      .onUpdate(() => setMotion({ ...animation }))
      .onComplete(() => denseSplineTween.start());

    denseSplineTween.chain(uniformSplineTween.chain(resetTween));
    denseSplineTween.start();

    return group;
  }, [motion]);

  useFrame((state) => {
    group.update(state.clock.getElapsedTime() * 1000);
  });

  return (
    <>
      <Line points={points} color={colors.secondary} />
      <DragControlPoints axisLock="z" points={points} setPoints={setPoints} />
      <BezierCurve points={points} resolution={2.5} uniform={true} />
    </>
  );
};

export const SplineNodesExampleScene = () => {
  return (
    <OrthographicScene>
      <Example />
    </OrthographicScene>
  );
};
