import { createRoot } from 'react-dom/client';

import { SplineNodesExampleScene } from './posts/wasi/SplineNodesExampleScene';
import { CurveNodesBinarySearchScene } from './posts/writing-a-roller-coaster-simulation/CurveNodesBinarySearchScene';
import { CurveNodesMotionEvaluationScene } from './posts/writing-a-roller-coaster-simulation/CurveNodesMotionEvaluationScene';
import { EvaluatingMotionScene } from './posts/writing-a-roller-coaster-simulation/EvaluatingMotionScene';
import { FrictionAndAirResistanceScene } from './posts/writing-a-roller-coaster-simulation/FrictionAndAirResistanceScene';
import { GravityScene } from './posts/writing-a-roller-coaster-simulation/GravityScene';
import { LinearRollerCoasterTrackScene } from './posts/writing-a-roller-coaster-simulation/LinearRollerCoasterTrackScene';
import { MatricesScene } from './posts/writing-a-roller-coaster-simulation/MatricesScene';

import './styles/common.css';

export {
  EvaluatingMotionScene,
  FrictionAndAirResistanceScene,
  GravityScene,
  LinearRollerCoasterTrackScene,
  SplineNodesExampleScene,
  MatricesScene,
  CurveNodesBinarySearchScene,
  CurveNodesMotionEvaluationScene,
  createRoot,
};
