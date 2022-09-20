/* eslint-disable unicorn/no-array-push-push */
import { describe, expect, test } from "vitest"
import RingBuffer from "./ringbuffer"

describe("RingBuffer", () => {
  test("can be initialized", () => {
    const buffer = new RingBuffer(1)

    expect(buffer.size).toBe(1)
    expect(buffer.content).toEqual([])
  })

  test("holds n values", () => {
    const buffer = new RingBuffer(5)

    buffer.push(1)
    buffer.push(2)
    buffer.push(3)
    buffer.push(4)
    buffer.push(5)

    expect(buffer.content).toEqual([1, 2, 3, 4, 5])
  })

  test("omits old values", () => {
    const buffer = new RingBuffer(5)

    buffer.push(1)
    buffer.push(2)
    buffer.push(3)
    buffer.push(4)
    buffer.push(5)

    buffer.push(6)
    buffer.push(7)
    buffer.push(8)
    buffer.push(9)

    expect(buffer.content).toEqual([5, 6, 7, 8, 9])
  })
})
