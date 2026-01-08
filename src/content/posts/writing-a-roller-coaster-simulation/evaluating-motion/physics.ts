import { SimulationState } from '../../../../helper/physics';

export const evaluateMotion = (
  state: SimulationState,
  acceleration: number,
  deltaTime: number,
): SimulationState => {
  const velocity = state.velocity + acceleration * deltaTime;
  const distanceTraveled =
    state.distanceTraveled + velocity * deltaTime;

  return { velocity, distanceTraveled, acceleration };
};
