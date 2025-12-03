export const length = (cp1, cp2) => cp1.distanceTo(cp2);

export const getPositionAtDistance = (cp1, cp2, distance) => {
  return cp1.clone().lerp(cp2, distance / length(cp1, cp2));
};

export const getForwardDirectionAtDistance = (cp1, cp2) => {
  return cp2.clone().sub(cp1).normalize();
};
