export function lowerBound(a, x, prop) {
  let l = 0;
  let h = a.length;

  while (l < h) {
    let mid = Math.floor((l + h) / 2);
    if (x >= a[mid][prop]) {
      l = mid + 1;
    } else {
      h = mid;
    }
  }

  return l;
}

export default lowerBound;
