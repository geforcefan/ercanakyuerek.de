import { Vector3 } from 'three';

export const evaluateMotionByForwardDirection = (state, forwardDirection, gravity, deltaTime) => {
  const acceleration = forwardDirection.dot(new Vector3(0, -gravity, 0));
  const velocity = state.velocity + acceleration * deltaTime;
  const distanceTraveled = state.distanceTraveled + velocity * deltaTime;

  return { velocity, distanceTraveled, acceleration };
};

export const evaluateMotionByForwardDirectionWithFriction = (
  state,
  forwardDirection,
  friction,
  airResistance,
  gravity,
  deltaTime,
) => {
  const velocityDirection = state.velocity < 0 ? -1 : 1;

  let energyLoss = airResistance * state.velocity * state.velocity;
  energyLoss += friction * gravity;
  energyLoss *= velocityDirection;

  let acceleration = forwardDirection.dot(new Vector3(0, -gravity, 0));
  acceleration -= energyLoss;

  const velocity = state.velocity + acceleration * deltaTime;
  const distanceTraveled = state.distanceTraveled + velocity * deltaTime;

  return { velocity, distanceTraveled, acceleration };
};
