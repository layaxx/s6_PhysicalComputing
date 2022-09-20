import { describe, expect, test } from "vitest"
import { polarToCartesian } from "./coordinates"

describe("polarToCartesian", () => {
  test("works as expected", () => {
    expect(polarToCartesian(90, 10)).toMatchObject({ x: 0, y: -10 })

    let { x, y } = polarToCartesian(180, 10)
    expect(x).toBe(10)
    expect(y).toBeCloseTo(0)
    ;({ x, y } = polarToCartesian(66, 12))
    expect(x).toBeCloseTo(-4.880_83)
    expect(y).toBeCloseTo(-10.962_545)
  })
})
