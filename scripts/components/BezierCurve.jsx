import useColors from "../hooks/useColors";
import React, { useMemo } from "react";
import { evaluate } from "../helper/bezier";
import Line from "./Line";
const BezierCurve = ({ points, resolution = 5 }) => {
  const colors = useColors();

  const nodes = useMemo(() => {
    return evaluate(points[0], points[1], points[2], points[3], resolution);
  }, [points, resolution]);

  return (
    <>
      {nodes.map((node) => (
        <mesh position={node.position}>
          <sphereGeometry attach="geometry" args={[0.1, 6, 6]} />
          <meshBasicMaterial attach="material" color={colors.secondary} />
        </mesh>
      ))}

      <Line points={points} color={colors.silent} lineWidth={0.01} />
      {!!nodes.length && (
        <Line
          points={nodes.map((node) => node.position)}
          color={colors.secondary}
          lineWidth={0.02}
        />
      )}
    </>
  );
};

export default BezierCurve;
