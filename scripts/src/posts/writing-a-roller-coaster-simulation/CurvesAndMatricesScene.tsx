import React, { useEffect, useMemo, useState } from 'react';
import { CameraControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { first } from 'lodash';
import last from 'lodash/last';
import set from 'lodash/set';
import Plot from 'react-plotly.js';
import { MathUtils, Vector2, Vector3 } from 'three';

import { ControlPoint } from '../../components/ControlPoint';
import CurveWireframe from '../../components/CurveWireframe';
import { DragControlPoints } from '../../components/DragControlPoints';
import Line from '../../components/Line';
import MatrixArrowHelper from '../../components/MatrixArrowHelper';
import { evaluate } from '../../helper/bezier';
import { evaluateSpline, makeCubicSpline } from '../../helper/cubic-spline';
import { CurveNode, getLength, getMatrixAtDistance } from '../../helper/curve';
import { getRoll } from '../../helper/matrix4';
import { evaluateMotionByMatrixWithEnergyLoss } from '../../helper/physics';
import { plotDataFromCurve, plotDataFromPoints } from '../../helper/plot';
import { uniformMap } from '../../helper/uniform-map';
import { fromMatrix4 } from '../../helper/vector3';
import useColors from '../../hooks/useColors';
import PerspectiveScene from '../../scenes/PerspectiveScene';

const TrainWithPhysics = (props: { curve: CurveNode[] }) => {
  const colors = useColors();
  const { curve } = props;

  const [simulationState, setSimulationState] = useControls(() => ({
    velocity: 0,
    distanceTraveled: 0,
    friction: {
      value: 0.03,
      pad: 5,
    },
    airResistance: {
      value: 0.0001,
      pad: 6,
    },
    acceleration: {
      value: 0,
      pad: 5,
    },
    gravity: {
      value: 9.81665,
      pad: 5,
    },
  }));

  const evaluatedMatrix = useMemo(
    () =>
      getMatrixAtDistance(
        curve,
        MathUtils.clamp(simulationState.distanceTraveled, 0, getLength(curve)),
      ),
    [curve, simulationState.distanceTraveled],
  );

  useFrame((state, deltaTime) => {
    setSimulationState(
      evaluateMotionByMatrixWithEnergyLoss(
        simulationState,
        evaluatedMatrix,
        simulationState.friction,
        simulationState.airResistance,
        simulationState.gravity,
        deltaTime,
      ),
    );
  });

  useEffect(() => {
    if (
      simulationState.distanceTraveled > getLength(curve) ||
      simulationState.distanceTraveled < 0
    ) {
      setSimulationState({
        velocity: 0,
        distanceTraveled: 0,
      });
    }
  }, [simulationState.distanceTraveled, setSimulationState, curve]);

  return (
    <>
      <MatrixArrowHelper matrix={evaluatedMatrix} />
      <ControlPoint position={fromMatrix4(evaluatedMatrix)} color={colors.highlight} />
    </>
  );
};

export const CurvesAndMatricesScene = () => {
  const colors = useColors();

  const [cubicPoints, setCubicPoints] = useState([
    new Vector3(0, 0, 0),
    new Vector3(10, 1, 0),
    new Vector3(20, 0, 0),
  ]);

  const [points, setPoints] = useState([
    new Vector3(0, 15, 0),
    new Vector3(5, 0, 0),
    new Vector3(25, 0, 0),
    new Vector3(30, 15, 0),
  ]);

  const cubicSpline = useMemo(
    () =>
      makeCubicSpline([
        new Vector2(
          (first(cubicPoints)?.x || 0) - Number.EPSILON * 1000,
          first(cubicPoints)?.y || 0,
        ),
        ...cubicPoints.map((v) => new Vector2(v.x, v.y)),
        new Vector2((last(cubicPoints)?.x || 0) + Number.EPSILON * 1000, last(cubicPoints)?.y || 0),
      ]),
    [cubicPoints],
  );

  const cubicSplineNodes = useMemo(
    () =>
      uniformMap(
        first(cubicPoints)?.x || 0,
        last(cubicPoints)?.x || 0,
        8,
        (t) => new Vector2(t, evaluateSpline(cubicSpline, t)),
      ),
    [cubicSpline],
  );

  const curve = useMemo(() => evaluate(points[0], points[1], points[2], points[3], 8), [points]);

  useEffect(() => {
    const length = getLength(curve);
    if (length > 0)
      setCubicPoints((cubicPoints) =>
        set(
          [...cubicPoints],
          cubicPoints.length - 1,
          last(cubicPoints)?.clone().setX(length) || new Vector3(),
        ),
      );
  }, [curve, setCubicPoints]);

  const data = [
    {
      ...plotDataFromCurve(curve, 2, getRoll),
      mode: 'lines',
    },
    {
      ...plotDataFromPoints(cubicSplineNodes),
    },
  ];

  return (
    <>
      <PerspectiveScene>
        <mesh receiveShadow={true} position={[0, -1, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[1000, 1000]} />
          <meshBasicMaterial color={colors.silent} />
        </mesh>
        <CameraControls makeDefault dollyToCursor={true} />

        <TrainWithPhysics curve={curve} />

        <DragControlPoints points={cubicPoints} setPoints={setCubicPoints} axisLock="z" />
        <Line
          points={cubicSplineNodes.map((v) => new Vector3(v.x, v.y, 0))}
          color={colors.secondary}
        />

        <Line points={points} color={colors.secondary} />
        <CurveWireframe color={colors.secondary} curve={curve} />
        <DragControlPoints points={points} setPoints={setPoints} />
      </PerspectiveScene>

      <div style={{ position: 'absolute' }}>
        <Plot
          data={data}
          layout={{
            margin: { l: 50, t: 20, b: 20, r: 20 },
          }}
        />
      </div>
    </>
  );
};
