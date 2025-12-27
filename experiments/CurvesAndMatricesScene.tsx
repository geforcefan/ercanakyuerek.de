import React, { useEffect, useMemo, useState } from 'react';
import {
  CameraControls,
  CameraControlsImpl,
  Line,
} from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import Plot from 'react-plotly.js';
import { MathUtils, Vector2, Vector3 } from 'three';

import { bezierSplineCurve } from '../../maths/bezier';
import { clampedCubicSplineCurve } from '../../maths/cubic-spline';
import {
  applyRollFromCurve,
  CurveNode,
  length,
  matrixAtDistance,
} from '../../maths/curve';
import { fromMatrix4 } from '../../maths/vector3';
import { evaluateMotionByMatrixWithEnergyLoss } from '../../helper/physics';
import { useColors } from '../../hooks/useColors';
import { useMeasure } from '../../hooks/useMeasure';

import { ControlPoint } from '../../components/ControlPoint';
import { CurveWireframe } from '../../components/CurveWireframe';
import { DragControlPoints } from '../../components/DragControlPoints';
import { MatrixArrowHelper } from '../../components/MatrixArrowHelper';
import { OrthographicScene } from '../../scenes/OrthographicScene';
import { PerspectiveScene } from '../../scenes/PerspectiveScene';

import { plotDataFromPoints } from './plot';

import './curves-and-matrices.css';

import { zRotation } from '../../maths/matrix4';
import { numberToHexString } from '../../helper/numberToHexString';

const gravity = 9.81665;
const friction = 0.03;
const airResistance = 0.0001;

const TrainWithPhysics = (props: { curve: CurveNode[] }) => {
  const colors = useColors();
  const { curve } = props;

  const [simulationState, setSimulationState] = useControls(() => ({
    velocity: 0,
    fps: 0,
    distanceTraveled: 0,
    acceleration: {
      value: 0,
      pad: 5,
    },
  }));

  const evaluatedMatrix = useMemo(
    () =>
      matrixAtDistance(
        curve,
        MathUtils.clamp(
          simulationState.distanceTraveled,
          0,
          length(curve),
        ),
      ),
    [curve, simulationState.distanceTraveled],
  );

  useFrame((state, deltaTime) => {
    setSimulationState({
      ...evaluateMotionByMatrixWithEnergyLoss(
        simulationState,
        evaluatedMatrix,
        friction,
        airResistance,
        gravity,
        deltaTime,
      ),
      fps: 1 / deltaTime,
    });
  });

  useEffect(() => {
    if (
      simulationState.distanceTraveled > length(curve) ||
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
      <ControlPoint
        position={fromMatrix4(evaluatedMatrix)}
        color={colors.highlight}
      />
    </>
  );
};

export const CurvesAndMatricesScene = () => {
  const {
    ref: plotContainerRef,
    dimensions: plotContainerDimensions,
  } = useMeasure<HTMLDivElement>();
  const colors = useColors();

  const [cubicPoints, setCubicPoints] = useState([
    new Vector3(0, 0),
    new Vector3(750, 50),
    new Vector3(1500, 0),
  ]);

  const [points, setPoints] = useState([
    new Vector3(-1500, 300, 0),
    new Vector3(5, 0, 0),
    new Vector3(25, 0, 0),
    new Vector3(1500, 300, 0),
  ]);

  const cubicCurve = useMemo(
    () =>
      clampedCubicSplineCurve(
        cubicPoints.map((v) => new Vector2(v.x, v.y)),
        0,
        0,
        2,
      ),
    [cubicPoints],
  );

  const curve = useMemo(
    () =>
      applyRollFromCurve(
        bezierSplineCurve(
          points[0],
          points[1],
          points[2],
          points[3],
          2,
        ),
        cubicCurve,
      ),
    [points, cubicCurve],
  );

  useEffect(() => {
    setCubicPoints((cubicPoints) => {
      const curveLength = length(curve);
      return [
        new Vector3(0, cubicPoints[0].y, 0),
        ...cubicPoints.slice(1, cubicPoints.length - 1),
        new Vector3(
          curveLength,
          cubicPoints[cubicPoints.length - 1].y,
          0,
        ),
      ];
    });
  }, [curve]);

  const rollNodes = useMemo(
    () =>
      curve.map(
        ({ matrix, distanceAtCurve }) =>
          new Vector2(
            distanceAtCurve,
            MathUtils.radToDeg(zRotation(matrix)),
          ),
      ),
    [curve],
  );

  const data = [
    {
      name: 'track roll',
      ...plotDataFromPoints(rollNodes),
    },
  ];

  return (
    <>
      <PerspectiveScene>
        <mesh
          receiveShadow={true}
          position={[0, -1, 0]}
          rotation-x={-Math.PI / 2}
        >
          <planeGeometry args={[1000, 1000]} />
          <meshBasicMaterial color={colors.silent} />
        </mesh>
        <CameraControls
          makeDefault
          dollyToCursor={true}
          draggingSmoothTime={0.03}
          dollySpeed={0.4}
          infinityDolly={true}
          dollyDragInverted={true}
          minDistance={0}
          maxDistance={Infinity}
          mouseButtons={{
            left: CameraControlsImpl.ACTION.ROTATE,
            right: CameraControlsImpl.ACTION.TRUCK,
            wheel: CameraControlsImpl.ACTION.DOLLY,
            middle: CameraControlsImpl.ACTION.NONE,
          }}
        />

        <TrainWithPhysics curve={curve} />

        <Line points={points} color={colors.secondary} />
        <CurveWireframe color={colors.secondary} curve={curve} />
        <DragControlPoints points={points} setPoints={setPoints} />
      </PerspectiveScene>

      <div className="viewport spline-viewport">
        <OrthographicScene camera={{ zoom: 20 }}>
          <CameraControls
            mouseButtons={{
              left: CameraControlsImpl.ACTION.NONE,
              right: CameraControlsImpl.ACTION.TRUCK,
              wheel: CameraControlsImpl.ACTION.ZOOM,
              middle: CameraControlsImpl.ACTION.NONE,
            }}
            makeDefault
            dollySpeed={0.4}
            dollyToCursor={true}
            draggingSmoothTime={0.03}
          />
          <DragControlPoints
            points={cubicPoints}
            setPoints={setCubicPoints}
            axisLock="z"
          />
          <Line
            points={cubicCurve.map((n) =>
              new Vector3().setFromMatrixPosition(n.matrix),
            )}
            color={colors.secondary}
          />
        </OrthographicScene>
      </div>
      <div ref={plotContainerRef} className="viewport plot-viewport">
        <Plot
          data={data}
          layout={{
            font: {
              color: numberToHexString(colors.secondary),
            },
            paper_bgcolor: numberToHexString(colors.primary),
            plot_bgcolor: numberToHexString(colors.primary),
            margin: { l: 50, t: 20, b: 20, r: 20 },
            autosize: true,
            ...plotContainerDimensions,
          }}
        />
      </div>
    </>
  );
};
