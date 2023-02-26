export default (points) => {
  return points.reduce((acc, point) => {
    acc.push(point.x, point.y, point.z);
    return acc;
  }, []);
};
