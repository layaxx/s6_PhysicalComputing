import { describe, expect, test } from "vitest"
import {
  getAverage,
  getAverageWithoutOutliers,
  getStandardDeviation,
  getSum,
} from "./statistics"

describe("getSum", () => {
  test("returns 0 for empty array", () => {
    expect(getSum([])).toBe(0)
  })

  test("returns value for single value array", () => {
    expect(getSum([8])).toBe(8)
  })

  test("works for positive values", () => {
    expect(getSum([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(45)
  })

  test("works for positive and negative values", () => {
    expect(getSum([1, 2, 3, 4, -5, 6, 7, -8, 9])).toBe(19)
  })
})

describe("getAverage", () => {
  test("returns 0 for empty array", () => {
    expect(getAverage([])).toBe(0)
  })

  test("returns value for single value array", () => {
    expect(getAverage([8])).toBe(8)
  })

  test("works for positive values", () => {
    expect(getAverage([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(5)
  })

  test("works for positive and negative values", () => {
    expect(getAverage([1, 2, -3, 4, 5, 6, -7, -8, 9])).toBe(1)
  })
})

describe("getAverageWithoutOutliers", () => {
  test("returns 0 for empty array", () => {
    expect(getAverageWithoutOutliers([])).toBe(0)
  })

  test("returns value for single value array", () => {
    expect(getAverageWithoutOutliers([8])).toBe(8)
  })

  test("works for positive values", () => {
    expect(getAverageWithoutOutliers([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(5)
  })

  test("works for positive and negative values", () => {
    expect(getAverageWithoutOutliers([1, 2, -3, 4, 5, 6, -7, -8, 9])).toBe(1)
  })

  test("omits outliers", () => {
    expect(getAverageWithoutOutliers([1, 2, -3, 4, 45, 5, 6, -7, -8, 9])).toBe(
      1
    )
  })
})

describe("getStandardDeviation", () => {
  test("returns 0 for empty array", () => {
    expect(getStandardDeviation([])).toBe(0)
  })

  test("uses given mean", () => {
    expect(getStandardDeviation([1, 2, 3], 1)).toBeCloseTo(1.290_994)
  })

  test("works as expected", () => {
    expect(getStandardDeviation([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBeCloseTo(
      2.581_988
    )
    expect(getStandardDeviation([1, 2, 3, 4, 5, 6, 7, 8, 999])).toBeCloseTo(
      312.548_662
    )
  })
})
