import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Vector3 } from "three";
import { Tween, Easing } from "tween.js";

import BezierCurve from "./components/BezierCurve";
import Scene from "./components/Scene";

const points = [
  new Vector3(-3, -3, 0),
  new Vector3(3, -3, 0),
  new Vector3(-3, 3, 0),
  new Vector3(3, 3, 0),
];

const Example = () => {
  const [motion, setMotion] = useState({
    resolution: 0,
  });

  useEffect(() => {
    const animation = { ...motion };

    const estimationSplineTween = new Tween(animation)
      .to({ resolution: 0.6 }, 1000)
      .easing(Easing.Linear.None)
      .onUpdate(() => {
        setMotion({ ...animation });
      });

    const denserSplineTween = new Tween(animation)
      .delay(4000)
      .to({ resolution: 3 }, 1000)
      .onUpdate(() => {
        setMotion({ ...animation });
      });

    estimationSplineTween.chain(denserSplineTween);
    estimationSplineTween.start();

    return () => {
      estimationSplineTween.stop();
    };
  }, []);

  return (
    <>
      <BezierCurve points={points} resolution={motion.resolution} />
    </>
  );
};

const wasi_sdk_writing_library_in_cpp = () => {
  document.body.innerHTML += `<div id="app"></div>`;
  createRoot(document.getElementById("app")).render(
    <Scene>
      <Example />
    </Scene>
  );
};

export default wasi_sdk_writing_library_in_cpp;
