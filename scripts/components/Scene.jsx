import React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { update } from "tween.js";

import useColors from "../hooks/useColors";
import { useDevicePixelRatio } from "../hooks/useDevicePixelRatio";

const Tween = () => {
  useFrame(() => {
    update();
  });

  return <></>;
};

const Scene = ({ children }) => {
  const colors = useColors();
  const dpr = useDevicePixelRatio();

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <Canvas orthographic camera={{ zoom: 30 }} dpr={dpr}>
        <Tween />
        <color attach="background" args={[colors.primary]} />
        {children}
      </Canvas>
    </div>
  );
};

export default Scene;
