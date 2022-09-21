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

/** Default size for buffering values */
export const defaultBufferSize = 50

/** Lookup containing prefixes for consistent changing */
export const prefixes = { gyro: "G", US: "U", debug: "Debug" }

/** Threshold indicating after how many time steps state changes to steady */
export const thresholdTime = 5
/** Threshold as Standard Deviation Multiplier indicating amplitude needed for state change */
export const sdMultiplier = 10

/** Rotation State */
export enum STATE {
  INSIDE /** Value is near baseline */,
  OVER /** Value is sig. larger than baseline but not steady */,
  OVER_STEADY /** Value is sig. larger than baseline and steady */,
  UNDER /** Value is sig. smaller than baseline but not steady */,
  UNDER_STEADY /** Value is sig. smaller than baseline and steady  */,
}
