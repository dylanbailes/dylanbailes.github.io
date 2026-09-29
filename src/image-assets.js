// Dimensions of the optimized assets; CSS keeps the project gallery frame stable.
const dimensions = {
  'profile': [600, 600],
  'mae3-robot': [426, 240],
  'mccb-final-design': [747, 678],
  'mccb-intermediate': [1200, 1071],
  'mccb-setup-web': [1200, 900],
  'mccb-surface-comparison': [597, 336],
  'robobutler-prototype': [1200, 1589],
  'robobutler-apriltag-depth-map': [320, 180],
  'robobutler-hardware-detail': [1200, 900],
  'robobutler-outdoor-test': [1200, 675],
  'uas-mesh-convergence': [960, 720],
  'uas-tolerance-workflow': [960, 720],
};

export function imageAttributes(src) {
  const name = src?.split('/').pop().replace(/\.[^.]+$/, '');
  const size = dimensions[name];
  return `decoding="async"${size ? ` width="${size[0]}" height="${size[1]}"` : ''}`;
}
