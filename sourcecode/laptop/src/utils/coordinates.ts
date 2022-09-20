export function polarToCartesian(
  angle: number,
  distance: number
): { x: number; y: number } {
  const a = distance * Math.sin(((angle - 90) / 180) * Math.PI)
  const b = distance * Math.cos(((angle - 90) / 180) * Math.PI)

  return { x: a, y: -b }
}
