import React, { useState } from "react";
import { Matrix4, Vector3 } from "three";

import Scene from "../components/Scene";
import Line from "../components/Line";
import useColors from "../hooks/useColors";
import { useFrame } from "@react-three/fiber";
import {
  getPositionAtDistance,
  getForwardDirectionAtDistance,
  length,
} from "../helper/linear";
import { evaluateMotionByForwardDirection } from "../helper/physics";
import { DragControls } from "@react-three/drei";

const gravity = 9.81;

const DemoLinearTrack = () => {
  const colors = useColors();

  const [cp1, setCp1] = useState(new Vector3(-12.5, 3, -1));
  const [cp2, setCp2] = useState(new Vector3(12.5, -3, -1));

  console.log({cp1, cp2})
  const [simulationState, setSimulationState] = useState({
    velocity: 0,
    distanceTraveled: 0,
    acceleration: 0,
  });

  useFrame((state, delta) => {
    if (
      simulationState.distanceTraveled > length(cp1, cp2) ||
      simulationState.distanceTraveled < 0
    )
      setSimulationState({
        velocity: 0,
        distanceTraveled: 0,
        acceleration: 0,
      });

    const forwardDirection = getForwardDirectionAtDistance(
      cp1,
      cp2,
      simulationState.distanceTraveled
    );

    setSimulationState((simulationState) =>
      evaluateMotionByForwardDirection(
        simulationState,
        forwardDirection,
        gravity,
        delta
      )
    );
  });

  const trainPosition = getPositionAtDistance(
    cp1,
    cp2,
    simulationState.distanceTraveled
  );

  return (
    <>
      <Line points={[cp1, cp2]} color={colors.secondary} lineWidth={0.02} />

      <DragControls
        axisLock="z"
        matrix={new Matrix4().setPosition(cp1)}
        onDrag={(localMatrix) => {
          setCp1(new Vector3().setFromMatrixPosition(localMatrix));
        }}
      >
        <mesh>
          <sphereGeometry attach="geometry" args={[0.2, 6, 6]} />
          <meshBasicMaterial attach="material" color={colors.secondary} />
        </mesh>
      </DragControls>

      <DragControls
        axisLock="z"
        matrix={new Matrix4().setPosition(cp2)}
        onDrag={(localMatrix) => {
          setCp2(new Vector3().setFromMatrixPosition(localMatrix));
        }}
      >
        <mesh>
          <sphereGeometry attach="geometry" args={[0.2, 6, 6]} />
          <meshBasicMaterial attach="material" color={colors.secondary} />
        </mesh>
      </DragControls>

      <mesh position={trainPosition}>
        <sphereGeometry attach="geometry" args={[0.2, 6, 6]} />
        <meshBasicMaterial attach="material" color={colors.secondary} />
      </mesh>
    </>
  );
};

export const DemoLinearTrackScene = () => {
  return (
    <Scene>
      <DemoLinearTrack />
    </Scene>
  );
};
