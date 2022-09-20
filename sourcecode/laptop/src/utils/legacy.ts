import type { NormalizedScanData } from "../classification/classification"
import { getAverageWithoutOutliers } from "./utils"

// Methods in this file are not currently used anywhere, but may be helpful in the future

/**
 * Tries to measure distance to corners.
 *
 * @param data
 * @returns undefined iff no valid measure is found, else shortest distance to corner
 */
export function getCornerMeasurement(
  data: NormalizedScanData
): number | undefined {
  const leftCorner = getMeasurement(data, 40, 50)
  const rightCorner = getMeasurement(data, 130, 140)

  if (leftCorner === undefined && rightCorner === undefined) {
    // No valid measurement
    return undefined
  }

  if (leftCorner === undefined) {
    // Only right Corner measurement was valid
    return rightCorner
  }

  if (rightCorner === undefined) {
    // Only left Corner measurement was valid
    return leftCorner
  }

  // Both measurements were valid, return shortest
  return Math.min(leftCorner, rightCorner)
}

/**
 * Tries to calculate the average of measurements in the given range
 *
 * @param data - list of measurements
 * @param from - start of range
 * @param to - end of range
 * @returns: undefined iff no values in range, else average of measurements in given range
 */
export function getMeasurement(
  data: NormalizedScanData,
  from: number,
  to: number
): number | undefined {
  const filteredData = data
    .filter(({ x }) => x >= from && x < to)
    .map(({ y }) => y)

  if (filteredData.length === 0) {
    return undefined
  }

  return getAverageWithoutOutliers(filteredData)
}
