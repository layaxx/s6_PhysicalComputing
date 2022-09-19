import { describe, expect, test, beforeEach } from "vitest"
import { STATE } from "./config"
import { POSITION, StateMachine } from "./state"

describe("testing StateMachine", () => {
  let stateMachine = new StateMachine()

  beforeEach(() => {
    stateMachine = new StateMachine()
  })

  test("No Rotation when inside", () => {
    stateMachine.updateState(POSITION.INSIDE)
    expect(stateMachine.state).toBe(STATE.INSIDE)
    expect(stateMachine.isInRotation).toBe(false)
    expect(stateMachine.justStartedRotation).toBe(false)
    expect(stateMachine.justFinishedRotation).toBe(false)
  })

  test("start rotation over", () => {
    stateMachine.updateState(POSITION.OVER)
    expect(stateMachine.state).toBe(STATE.OVER)
    expect(stateMachine.isInRotation).toBe(true)
    expect(stateMachine.justStartedRotation).toBe(true)
  })

  test("active rotation over", () => {
    stateMachine.updateState(POSITION.OVER)
    stateMachine.updateState(POSITION.OVER)
    stateMachine.updateState(POSITION.OVER)
    stateMachine.updateState(POSITION.OVER)
    stateMachine.updateState(POSITION.OVER)
    stateMachine.updateState(POSITION.OVER)
    expect(stateMachine.state).toBe(STATE.OVER)
    expect(stateMachine.isInRotation).toBe(true)
  })

  test("finish rotation over via jump", () => {
    stateMachine.state = STATE.OVER
    stateMachine.updateState(POSITION.UNDER)

    expect(stateMachine.justFinishedRotation).toBe(true)
  })

  test("finish rotation over", () => {
    stateMachine.state = STATE.OVER
    stateMachine.counterTime = 4

    stateMachine.updateState(POSITION.INSIDE)
    stateMachine.updateState(POSITION.INSIDE)
    stateMachine.updateState(POSITION.INSIDE)
    stateMachine.updateState(POSITION.INSIDE)

    expect(stateMachine.isInRotation).toBe(false)
    expect(stateMachine.justFinishedRotation).toBe(true)
    expect(stateMachine.state).toBe(STATE.INSIDE)
  })

  // Under
  test("start rotation under", () => {
    stateMachine.updateState(POSITION.UNDER)
    expect(stateMachine.state).toBe(STATE.UNDER)
    expect(stateMachine.isInRotation).toBe(true)
    expect(stateMachine.justStartedRotation).toBe(true)
  })

  test("active rotation over", () => {
    stateMachine.updateState(POSITION.UNDER)
    stateMachine.updateState(POSITION.UNDER)
    stateMachine.updateState(POSITION.UNDER)
    stateMachine.updateState(POSITION.UNDER)
    stateMachine.updateState(POSITION.UNDER)
    stateMachine.updateState(POSITION.UNDER)
    expect(stateMachine.state).toBe(STATE.UNDER)
    expect(stateMachine.isInRotation).toBe(true)
  })

  test("finish rotation over via jump", () => {
    stateMachine.state = STATE.UNDER
    stateMachine.updateState(POSITION.OVER)

    expect(stateMachine.justFinishedRotation).toBe(true)
  })

  test("finish rotation over", () => {
    stateMachine.state = STATE.UNDER
    stateMachine.counterTime = 4

    stateMachine.updateState(POSITION.INSIDE)
    stateMachine.updateState(POSITION.INSIDE)
    stateMachine.updateState(POSITION.INSIDE)
    stateMachine.updateState(POSITION.INSIDE)

    expect(stateMachine.isInRotation).toBe(false)
    expect(stateMachine.justFinishedRotation).toBe(true)
    expect(stateMachine.state).toBe(STATE.UNDER)
  })
})
