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
    resolution: 0.5,
    uniform: 0,
  });

  useEffect(() => {
    const animation = { ...motion };

    const denseSplineTween = new Tween(animation)
      .to({ resolution: 2.5 }, 1000)
      .easing(Easing.Linear.None)
      .onUpdate(() => {
        setMotion({ ...animation });
      });

    const uniformSplineTween = new Tween(animation)
      .delay(3000)
      .to({ uniform: 1 }, 500)
      .onUpdate(() => {
        setMotion({ ...animation });
      });

    const resetTween = new Tween(animation)
      .delay(2000)
      .to({ uniform: 0, resolution: 0.5 }, 1000)
      .onUpdate(() => {
        setMotion({ ...animation });
      })
      .onComplete(() => {
        denseSplineTween.start();
      });

    denseSplineTween.chain(uniformSplineTween.chain(resetTween));
    denseSplineTween.start();
  }, []);

  return (
    <>
      <BezierCurve
        points={points}
        resolution={motion.resolution}
        uniform={!!Math.round(motion.uniform)}
      />
    </>
  );
};

const wasi_sdk_writing_library_in_cpp1 = () => {
  document.body.innerHTML += `<div id="app"></div>`;
  createRoot(document.getElementById("app")).render(
    <Scene>
      <Example />
    </Scene>
  );
};

export default wasi_sdk_writing_library_in_cpp;
