import React, { useEffect, useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Easing, Group, Tween } from '@tweenjs/tween.js';
import { useControls } from 'leva';
import { Vector3 } from 'three';

import { deCasteljau } from '../../../../maths/bezier';
import { uniformSampleMap } from '../../../../helper/uniform-sample';
import { useColors } from '../../../../hooks/useColors';

import { ControlPoint } from '../../../../components/curve/ControlPoint';
import { DragControlPoints } from '../../../../components/curve/DragControlPoints';
import { OrthographicScene } from '../../../../scenes/OrthographicScene';

export const DeCasteljauVisualization = () => {
  const colors = useColors();

  const [state, setState] = useControls(() => ({
    t: {
      min: 0,
      max: 1,
      step: 0.01,
      value: 0,
    },
    iteration: {
      min: 0,
      max: 2,
      value: 0,
      step: 1,
    },
    stopAnimation: false,
  }));

  const [points, setPoints] = useState([
    new Vector3(-4.5, -7, 0),
    new Vector3(-4.5, 1.8, 0),
    new Vector3(4.5, 1.8, 0),
    new Vector3(4.5, -7, 0),
  ]);

  const iterations = useMemo(() => {
    const a = points[0].clone().lerp(points[1], state.t);
    const b = points[1].clone().lerp(points[2], state.t);
    const c = points[2].clone().lerp(points[3], state.t);
    const d = a.clone().lerp(b, state.t);
    const e = b.clone().lerp(c, state.t);
    const f = d.clone().lerp(e, state.t);
    return [[a, b, c], [d, e], [f]];
  }, [points, state.t]);

  const animationGroup = useMemo(() => {
    const group = new Group();

    const animation = {
      t: 0,
      iteration: state.iteration,
    };

    const toFullEvaluationTween = new Tween(animation)
      .to({ t: 1 }, 3000)
      .easing(Easing.Linear.None)
      .onUpdate((obj) => setState({ ...obj }));

    const toNoEvaluationTween = new Tween(animation)
      .to({ t: 0 }, 3000)
      .easing(Easing.Linear.None)
      .onUpdate((obj) => setState({ ...obj }))
      .onComplete(() => {
        setState({
          iteration: (state.iteration + 1) % iterations.length,
        });
      });

    group.add(toFullEvaluationTween);
    group.add(toNoEvaluationTween);
    toFullEvaluationTween.chain(toNoEvaluationTween);
    if (!state.stopAnimation) toFullEvaluationTween.start();

    return group;
  }, [
    iterations.length,
    setState,
    state.iteration,
    state.stopAnimation,
  ]);

  useEffect(() => {
    if (state.stopAnimation)
      animationGroup.getAll().forEach((tween) => tween.stop());
    else animationGroup.getAll()[0]?.start();
  }, [state.stopAnimation, animationGroup]);

  const curve = useMemo(
    () =>
      uniformSampleMap(0, state.t, 40, (t) => deCasteljau(points, t)),
    [points, state.t],
  );

  useFrame(() => {
    animationGroup.update();
  });

  return (
    <>
      {iterations
        .slice(0, state.iteration + 1)
        .map((iteration, index) => {
          const color =
            index === state.iteration
              ? colors.highlight
              : colors.secondary;

          return (
            <React.Fragment key={index}>
              {state.iteration >= iterations.length - 1 && (
                <Line points={curve} color={color} />
              )}
              {iteration.map((position, nodeIndex) => (
                <ControlPoint
                  key={nodeIndex}
                  size="sm"
                  position={position}
                  color={color}
                />
              ))}
              <Line points={iteration} color={color} />
            </React.Fragment>
          );
        })}

      <Line points={points} color={colors.secondary} />

      <DragControlPoints
        axisLock="z"
        points={points}
        setPoints={setPoints}
      />
    </>
  );
};

export const DeCasteljauVisualizationScene = () => {
  return (
    <>
      <OrthographicScene>
        <DeCasteljauVisualization />
      </OrthographicScene>
    </>
  );
};
