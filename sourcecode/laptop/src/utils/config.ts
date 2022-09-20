export const colors = [
  "#ff003e", // 0 = red
  "#537bc4", // 1 = blue
  "#f67019", // 2 = orange
  "#f53794", // 3 = pink
  "#acc236", // 4 = light green
  "#166a8f", // 5 = dark blue
  "#00a950", // 6 = green
  "#58595b", // 7 = gray
  "#4dc9f6", // 8 = cyan
  "#8549ba", // 9 = purple
]
export const defaultBufferSize = 50

export const prefixes = { gyro: "G", US: "U" }

export const takeEveryNth = 1

export const thresholdTime = 5
export const sdMultiplier = 10

export const rotationThreshold = -500_000
export const isCorrectRotation = (auc: number) => auc < rotationThreshold

export enum STATE {
  INSIDE,
  OVER,
  OVER_STEADY,
  UNDER,
  UNDER_STEADY,
}
