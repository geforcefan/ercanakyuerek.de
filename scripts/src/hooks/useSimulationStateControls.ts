import { useControls } from 'leva';

export const useSimulationStateControls = () => {
  return useControls(() => ({
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
};
