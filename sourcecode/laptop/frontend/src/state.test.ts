import { describe, expect, test, beforeEach } from "vitest"
import { STATE } from "./config"
import { POSITION, StateMachine } from "./state"

const noRotation = {
  hasFinishedRotation: false,
  isInRotation: false,
}

const activeRotation = {
  hasFinishedRotation: false,
  isInRotation: true,
}

const finishedRotation = {
  hasFinishedRotation: true,
  isInRotation: false,
}

describe("testing StateMachine", () => {
  let stateMachine = new StateMachine()

  beforeEach(() => {
    stateMachine = new StateMachine()
  })

  test("No Rotation when inside", () => {
    stateMachine.updateState(POSITION.INSIDE)
    expect(stateMachine.state).toEqual(noRotation)
  })

  test("start rotation over", () => {
    expect(stateMachine.updateState(POSITION.OVER)).toEqual(activeRotation)
    expect(stateMachine.state).toBe(STATE.OVER_RISING)
  })

  test("active rotation over", () => {
    stateMachine.updateState(POSITION.OVER)
    stateMachine.updateState(POSITION.OVER)
    stateMachine.updateState(POSITION.OVER)
    const result = stateMachine.updateState(POSITION.OVER)
    expect(stateMachine.state).toBe(STATE.OVER_STEADY)
    expect(result).toEqual(activeRotation)
  })

  test("finish rotation over via jump", () => {
    stateMachine.updateState(POSITION.OVER)
    stateMachine.updateState(POSITION.OVER)
    stateMachine.updateState(POSITION.OVER)
    stateMachine.updateState(POSITION.OVER)

    expect(stateMachine.updateState(POSITION.UNDER)).toEqual(finishedRotation)
  })

  test("finish rotation over", () => {
    stateMachine.updateState(POSITION.OVER)
    stateMachine.updateState(POSITION.OVER)
    stateMachine.updateState(POSITION.OVER)
    stateMachine.updateState(POSITION.OVER)

    stateMachine.updateState(POSITION.INSIDE)
    stateMachine.updateState(POSITION.INSIDE)
    stateMachine.updateState(POSITION.INSIDE)
    expect(stateMachine.updateState(POSITION.INSIDE)).toEqual(finishedRotation)
  })

  // Under

  test("start rotation under", () => {
    expect(stateMachine.updateState(POSITION.UNDER)).toEqual(activeRotation)
    expect(stateMachine.state).toBe(STATE.UNDER_RISING)
  })

  test("active rotation under", () => {
    stateMachine.updateState(POSITION.UNDER)
    stateMachine.updateState(POSITION.UNDER)
    stateMachine.updateState(POSITION.UNDER)
    const result = stateMachine.updateState(POSITION.UNDER)
    expect(stateMachine.state).toBe(STATE.UNDER_STEADY)
    expect(result).toEqual(activeRotation)
  })

  test("finish rotation under via jump", () => {
    stateMachine.updateState(POSITION.UNDER)
    stateMachine.updateState(POSITION.UNDER)
    stateMachine.updateState(POSITION.UNDER)
    stateMachine.updateState(POSITION.UNDER)

    expect(stateMachine.updateState(POSITION.OVER)).toEqual(finishedRotation)
  })

  test("finish rotation under", () => {
    stateMachine.updateState(POSITION.UNDER)
    stateMachine.updateState(POSITION.UNDER)
    stateMachine.updateState(POSITION.UNDER)
    stateMachine.updateState(POSITION.UNDER)

    stateMachine.updateState(POSITION.INSIDE)
    stateMachine.updateState(POSITION.INSIDE)
    stateMachine.updateState(POSITION.INSIDE)
    expect(stateMachine.updateState(POSITION.INSIDE)).toEqual(finishedRotation)
  })
})
