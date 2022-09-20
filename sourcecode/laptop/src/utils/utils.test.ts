import dayjs from "dayjs"
import { describe, expect, test } from "vitest"
import {
  convertToCentimeters,
  convertToMeters,
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

  test("works as expected for larger values", () => {
    expect(convertToMeters(123_456)).toBeCloseTo(10.493_77)
  })
})

describe("convertToCentimeters", () => {
  test("does not throw for negative", () => {
    expect(() => convertToCentimeters(-666)).not.toThrow()
  })

  test("works as expected", () => {
    expect(convertToCentimeters(10_000)).toBe(85)
  })

  test("works as expected for larger values", () => {
    expect(convertToCentimeters(123_456)).toBeCloseTo(1049.377)
  })
})
