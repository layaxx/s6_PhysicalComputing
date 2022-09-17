export const colors = [
  "#FF003E", // 0 = red
  "#E2AF56", // 1 = orangish
  "#00B9D7", // 2 = cyan
  "#00A06E", // 3 = green
  "#D0D7D8", // 4 = grayish
  "brown", // 5 = brown
  "black", // 6 = black
]
export const bufferSize = 50

export const prefixes = { gyro: "GyroX", US: "Ultrasound" }

export const takeEveryNth = 1 // TODO: not working properly

export const thresholdTime = 5
export const sdMultiplier = 10

export const rotationThreshold = -500_000
export const isCorrectRotation = (auc: number) => auc < rotationThreshold

export enum STATE {
  INSIDE_STEADY,
  OVER_RISING,
  OVER_FALLING,
  OVER_STEADY,
  UNDER_RISING,
  UNDER_FALLING,
  UNDER_STEADY,
}
