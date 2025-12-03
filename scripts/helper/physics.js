import { Vector3 } from 'three';

export const evaluateMotionByForwardDirection = (state, forwardDirection, gravity, deltaTime) => {
  const acceleration = forwardDirection.dot(new Vector3(0, -gravity, 0));
  const velocity = state.velocity + acceleration * deltaTime;
  const distanceTraveled = state.distanceTraveled + velocity * deltaTime;

  return { velocity, distanceTraveled, acceleration };
};
