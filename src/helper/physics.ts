import { Matrix4, Vector3 } from 'three';

import { toFrontDirection } from '../maths/matrix4';

export type SimulationState = {
  velocity: number;
  distanceTraveled: number;
  acceleration: number;
};

export const evaluateMotion = (
  state: SimulationState,
  transformation: Matrix4,
  additionalAcceleration: number,
  friction: number,
  airResistance: number,
  gravity: number,
  deltaTime: number,
): SimulationState => {
  const forwardDirection = toFrontDirection(transformation);
  const velocityDirection = state.velocity < 0 ? -1 : 1;

  let energyLoss = airResistance * state.velocity * state.velocity;
  energyLoss += friction * gravity;
  energyLoss *= velocityDirection;

  let acceleration = forwardDirection.dot(
    new Vector3(0, -gravity, 0),
  );
  acceleration -= energyLoss;
  acceleration += additionalAcceleration;

  const velocity = state.velocity + acceleration * deltaTime;
  const distanceTraveled =
    state.distanceTraveled + velocity * deltaTime;

  return { velocity, distanceTraveled, acceleration };
};
