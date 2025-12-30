import React, { useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Easing, Group, Tween } from '@tweenjs/tween.js';
import { Vector3 } from 'three';

import { useColors } from '../../../../hooks/useColors';

import { BezierCurve } from '../../../../components/BezierCurve';
import { DragControlPoints } from '../../../../components/DragControlPoints';
import { OrthographicScene } from '../../../../scenes/OrthographicScene';

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

    const animation = {
      resolution: 0.5,
      uniform: 0,
    };

    const denseBezierTween = new Tween(animation, group)
      .to({ resolution: 2.5 }, 1000)
      .easing(Easing.Linear.None)
      .onUpdate(() => setMotion({ ...animation }));

    const uniformBezierTween = new Tween(animation, group)
      .delay(3000)
      .to({ uniform: 1 }, 500)
      .onUpdate(() => setMotion({ ...animation }));

    const looseTween = new Tween(animation, group)
      .delay(2000)
      .to({ resolution: 0.5 }, 1000)
      .onUpdate(() => setMotion({ ...animation }));

    const resetTween = new Tween(animation, group)
      .delay(1000)
      .to({ uniform: 0 }, 500)
      .onUpdate(() => setMotion({ ...animation }))
      .onComplete(() => denseBezierTween.start());

    denseBezierTween.chain(
      uniformBezierTween.chain(looseTween.chain(resetTween)),
    );

    denseBezierTween.start();

    return group;
  }, []);

  useFrame((state) => {
    group.update(state.clock.getElapsedTime() * 1000);
  });

  return (
    <>
      <Line
        points={points}
        color={colors.highlight}
        segments={true}
      />
      <DragControlPoints
        axisLock="z"
        points={points}
        setPoints={setPoints}
      />
      <BezierCurve
        points={points}
        resolution={motion.resolution}
        uniform={!!Math.round(motion.uniform)}
        showNodes={true}
      />
    </>
  );
};

export const BezierNodesExampleScene = () => {
  return (
    <OrthographicScene>
      <Example />
    </OrthographicScene>
  );
};
