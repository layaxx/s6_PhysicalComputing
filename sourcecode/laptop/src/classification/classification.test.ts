import { describe, expect, test } from "vitest"
import {
  classifyJunction,
  JUNCTION,
  normalizeDataYValues,
} from "./classification"

import testData from "./data/test.json"

describe("classifyJunction", () => {
  describe("empiric data", () => {
    test("T Junction", () => {
      expect(normalizeDataYValues(testData.empiric.t)).toEqual(
        testData.empiric.t
      )
      expect(classifyJunction(testData.empiric.t)[0]).toEqual(JUNCTION.T)
    })
  })

  describe("theoretic data", () => {
    test("t Junction", () => {
      expect(classifyJunction(testData.reference.t)[0]).toEqual(JUNCTION.T)
    })

    test("x Junction", () => {
      expect(classifyJunction(testData.reference.x)[0]).toEqual(JUNCTION.X)
    })

    test("corridor", () => {
      expect(classifyJunction(testData.reference.c)[0]).toEqual(JUNCTION.C)
    })
  })
})
