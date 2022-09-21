import dayjs from "dayjs"
import { describe, expect, test } from "vitest"
import {
  convertAngleToRotationSum,
  convertRotationSumToAngle,
  convertToCentimeters,
  convertToMeters,
  convertToRotationSpeed,
  formatTime,
  formatToNDigits,
} from "./utils"

describe("formatTime", () => {
  test("works as expected", () => {
    expect(formatTime(dayjs("2022-09-20T19:30:00.620Z").toDate())).toEqual(
      "20.09.2022-21:30:00.620"
    )
  })

  test("works with current Date as default", () => {
    expect(formatTime().length).toBe(23)
  })
})

describe("formatToNDigits", () => {
  test("works for less", () => {
    expect(formatToNDigits(2, 2)).toEqual("02")
  })

  test("works for larger", () => {
    expect(formatToNDigits(256, 2)).toEqual("256")
  })

  test("works for decimals", () => {
    expect(formatToNDigits(2.6, 2)).toEqual("02.6")
  })
})

describe("convertToMeters", () => {
  test("does not throw for negative", () => {
    expect(() => convertToMeters(-666)).not.toThrow()
  })

  test("works as expected", () => {
    expect(convertToMeters(10_000)).toBeCloseTo(0.85)
  })

  test("caps for larger values", () => {
    expect(convertToMeters(123_456)).toBeCloseTo(4)
  })
})

describe("convertToCentimeters", () => {
  test("does not throw for negative", () => {
    expect(() => convertToCentimeters(-666)).not.toThrow()
  })

  test("works as expected", () => {
    expect(convertToCentimeters(10_000)).toBe(85)
  })

  test("caps larger values", () => {
    expect(convertToCentimeters(123_456)).toBeCloseTo(400)
  })
})

describe("convertToRotationSpeed", () => {
  test("returns 0 for 0", () => {
    expect(convertToRotationSpeed(0)).toBe(0)
  })

  test("works for positive values", () => {
    expect(convertToRotationSpeed(1000)).toBeCloseTo(7.629_39)
  })

  test("works for max value values", () => {
    expect(convertToRotationSpeed(2 ** 15)).toBe(250)
  })

  test("caps larger values", () => {
    expect(convertToRotationSpeed(123_456)).toBeCloseTo(250)
  })

  test("works for negative values", () => {
    expect(convertToRotationSpeed(-1000)).toBeCloseTo(-7.629_39)
  })

  test("works for min value value", () => {
    expect(convertToRotationSpeed(-(2 ** 15))).toBe(-250)
  })

  test("caps smaller values", () => {
    expect(convertToRotationSpeed(-123_456)).toBeCloseTo(-250)
  })
})

describe("convertRotationSumToAngle", () => {
  test("returns 0 for 0", () => {
    expect(convertRotationSumToAngle(0)).toBe(0)
  })

  test("works for positive values", () => {
    expect(convertRotationSumToAngle(100_000)).toBeCloseTo(24.22)
    expect(convertRotationSumToAngle(750_000)).toBeCloseTo(181.652)
  })

  test("works for negative values", () => {
    expect(convertRotationSumToAngle(-250_000)).toBeCloseTo(-60.55)
    expect(convertRotationSumToAngle(-743_178.2)).toBeCloseTo(-180)
  })
})

describe("convertAngleToRotationSum", () => {
  test("returns 0 for 0", () => {
    expect(convertAngleToRotationSum(0)).toBe(0)
  })

  test("works for positive values", () => {
    expect(convertAngleToRotationSum(66)).toBeCloseTo(272_498.688)
    expect(convertAngleToRotationSum(360)).toBeCloseTo(1_486_356.48)
  })

  test("works for negative values", () => {
    expect(convertAngleToRotationSum(-24)).toBeCloseTo(-99_090.432)
    expect(convertAngleToRotationSum(-200)).toBeCloseTo(-825_753.6)
  })
})
