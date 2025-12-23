import React from 'react';
import ReactDOM from 'react-dom/client';

import './styles/common.css';

import { CurveNodesMotionEvaluationScene } from './posts/writing-a-roller-coaster-simulation/CurveNodesMotionEvaluationScene';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <CurveNodesMotionEvaluationScene />
  </React.StrictMode>,
);
