import { useControls } from 'leva';

export const useSimulationStateControls = (
  init: {
    velocity?: number;
    distanceTraveled?: number;
    friction?: number;
    airResistance?: number;
    gravity?: number;
    simulationSpeed?: number;
  } = {},
) => {
  return useControls(() => ({
    velocity: init.velocity ?? 0,
    distanceTraveled: init.distanceTraveled ?? 0,
    friction: {
      value: init.friction ?? 0.03,
      pad: 5,
    },
    airResistance: {
      value: init.airResistance ?? 2e-05,
      pad: 6,
    },
    acceleration: {
      value: 0,
      pad: 5,
    },
    gravity: {
      value: init.gravity ?? 9.81665,
      pad: 5,
    },
    simulationSpeed: {
      min: 0.25,
      max: 4,
      step: 0.25,
      value: init.simulationSpeed ?? 1,
    },
  }));
};
