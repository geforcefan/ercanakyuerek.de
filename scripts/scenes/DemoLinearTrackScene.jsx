import React, { useEffect, useState } from "react";
import { Matrix4, Vector3 } from "three";
import { useControls } from "leva";

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
import { DragControlPosition } from "../components/DragControlPosition";
import { ControlPoint } from "../components/ControlPoint";

const DemoLinearTrack = () => {
  const colors = useColors();

  const [cp1, setCp1] = useState(new Vector3(-12, 2, 0));
  const [cp2, setCp2] = useState(new Vector3(2, -1, 0));

  const [simulationState, setSimulationState] = useControls(() => ({
    velocity: 0,
    distanceTraveled: 0,
    acceleration: 0,
  }));

  useFrame((state, delta) => {
    setSimulationState(
      evaluateMotionByForwardDirection(
        simulationState,
        getForwardDirectionAtDistance(
          cp1,
          cp2,
          simulationState.distanceTraveled
        ),
        9.81,
        delta
      )
    );
  });

  useEffect(() => {
    if (
      simulationState.distanceTraveled > length(cp1, cp2) ||
      simulationState.distanceTraveled < 0
    ) {
      setSimulationState({
        velocity: 0,
        distanceTraveled: 0,
        acceleration: 0,
      });
    }
  }, [simulationState.distanceTraveled]);

  const trainPosition = getPositionAtDistance(
    cp1,
    cp2,
    simulationState.distanceTraveled
  );

  return (
    <>
      <DragControlPosition axisLock="z" position={cp1} onDrag={setCp1}>
        <ControlPoint />
      </DragControlPosition>

      <DragControlPosition axisLock="z" position={cp2} onDrag={setCp2}>
        <ControlPoint />
      </DragControlPosition>

      <Line points={[cp1, cp2]} color={colors.secondary} lineWidth={0.02} />

      <ControlPoint position={trainPosition} />
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
