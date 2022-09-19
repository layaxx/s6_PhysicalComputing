import { getAverageWithoutOutliers } from "./utils"

export enum JUNCTION {
  X, // X Junction
  T, // T Junction
  C, // Corridor
}

export type NormalizedScanData = Array<{ x: number; y: number }>

export function classifyJunction(data: NormalizedScanData): JUNCTION {
  const cornerMeasurement = getCornerMeasurement(data)
  const estimatedPathWidth = cornerMeasurement
    ? cornerMeasurement * 2
    : undefined

  // Probably useless

  // Corridor: Left === right, center >> left

  // T Left >> center, right >> center

  // X: else ??

  console.log(data, cornerMeasurement)

  return JUNCTION.C
}

function getCornerMeasurement(data: NormalizedScanData): number | undefined {
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

function getMeasurement(
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
