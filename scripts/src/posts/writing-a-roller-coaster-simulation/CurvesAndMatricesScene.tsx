import React, { useEffect, useMemo, useState } from 'react';
import { CameraControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { MathUtils, Vector3 } from 'three';

import { ControlPoint } from '../../components/ControlPoint';
import CurveWireframe from '../../components/CurveWireframe';
import { DragControlPoints } from '../../components/DragControlPoints';
import Line from '../../components/Line';
import MatrixArrowHelper from '../../components/MatrixArrowHelper';
import { evaluate } from '../../helper/bezier';
import { getLength, getMatrixAtDistance } from '../../helper/curve';
import { evaluateMotionByMatrixWithEnergyLoss } from '../../helper/physics';
import { fromMatrix4 } from '../../helper/vector3';
import useColors from '../../hooks/useColors';
import PerspectiveScene from '../../scenes/PerspectiveScene';

const CurvesAndMatrices = () => {
  const colors = useColors();

  const [points, setPoints] = useState([
    new Vector3(-5, 15, 0),
    new Vector3(0, 0, 0),
    new Vector3(15, 0, 0),
    new Vector3(20, 10, 0),
  ]);

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

  const curve = useMemo(() => evaluate(points[0], points[1], points[2], points[3], 2.5), [points]);

  useFrame((state, deltaTime) => {
    setSimulationState(
      evaluateMotionByMatrixWithEnergyLoss(
        simulationState,
        getMatrixAtDistance(curve, simulationState.distanceTraveled),
        simulationState.friction,
        simulationState.airResistance,
        simulationState.gravity,
        deltaTime,
      ),
    );
  });

  // Reset simulation state if train overshoots track
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
  }, [simulationState.distanceTraveled, points, setSimulationState, curve]);

  const matrix = getMatrixAtDistance(
    curve,
    MathUtils.clamp(simulationState.distanceTraveled, 0, getLength(curve)),
  );

  const trainPosition = fromMatrix4(matrix);

  return (
    <>
      <MatrixArrowHelper matrix={matrix} />
      <ControlPoint position={trainPosition} color={colors.highlight} />

      <Line points={points} color={colors.secondary} />
      <CurveWireframe color={colors.secondary} curve={curve} />
      <DragControlPoints points={points} setPoints={setPoints} />
    </>
  );
};

export const CurvesAndMatricesScene = () => {
  const colors = useColors();

  return (
    <PerspectiveScene>
      <mesh receiveShadow={true} position={[0, -1, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial color={colors.silent} />
      </mesh>
      <CameraControls makeDefault dollyToCursor={true} />
      <CurvesAndMatrices />
    </PerspectiveScene>
  );
};
