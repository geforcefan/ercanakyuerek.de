import { Matrix4, Vector3 } from 'three';
import { toFrontDirection } from '../maths/matrix4';

export type SimulationState = {
  velocity: number;
  distanceTraveled: number;
  acceleration: number;
};

export const evaluateMotionByAcceleration = (
  state: SimulationState,
  acceleration: number,
  deltaTime: number,
): SimulationState => {
  const velocity = state.velocity + acceleration * deltaTime;
  const distanceTraveled =
    state.distanceTraveled + velocity * deltaTime;

  return { velocity, distanceTraveled, acceleration };
};

export const evaluateMotionByForwardDirection = (
  state: SimulationState,
  forwardDirection: Vector3,
  gravity: number,
  deltaTime: number,
): SimulationState => {
  const acceleration = forwardDirection.dot(
    new Vector3(0, -gravity, 0),
  );
  const velocity = state.velocity + acceleration * deltaTime;
  const distanceTraveled =
    state.distanceTraveled + velocity * deltaTime;

  return { velocity, distanceTraveled, acceleration };
};

export const evaluateMotionByForwardDirectionWithFriction = (
  state: SimulationState,
  forwardDirection: Vector3,
  friction: number,
  airResistance: number,
  gravity: number,
  deltaTime: number,
): SimulationState => {
  const velocityDirection = state.velocity < 0 ? -1 : 1;

  let energyLoss = airResistance * state.velocity * state.velocity;
  energyLoss += friction * gravity;
  energyLoss *= velocityDirection;

  let acceleration = forwardDirection.dot(
    new Vector3(0, -gravity, 0),
  );
  acceleration -= energyLoss;

  const velocity = state.velocity + acceleration * deltaTime;
  const distanceTraveled =
    state.distanceTraveled + velocity * deltaTime;

  return { velocity, distanceTraveled, acceleration };
};

export const evaluateMotion = (
  state: SimulationState,
  matrix: Matrix4,
  friction: number,
  airResistance: number,
  gravity: number,
  deltaTime: number,
): SimulationState => {
  const forwardDirection = toFrontDirection(matrix);
  const velocityDirection = state.velocity < 0 ? -1 : 1;

  let energyLoss = airResistance * state.velocity * state.velocity;
  energyLoss += friction * gravity;
  energyLoss *= velocityDirection;

  let acceleration = forwardDirection.dot(
    new Vector3(0, -gravity, 0),
  );
  acceleration -= energyLoss;

  const velocity = state.velocity + acceleration * deltaTime;
  const distanceTraveled =
    state.distanceTraveled + velocity * deltaTime;

  return { velocity, distanceTraveled, acceleration };
};
