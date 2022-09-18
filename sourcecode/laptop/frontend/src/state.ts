/* eslint-disable complexity */
import { STATE, thresholdTime } from "./config"

export enum POSITION {
  OVER,
  UNDER,
  INSIDE,
}
export class StateMachine {
  state: STATE = STATE.INSIDE_STEADY
  counterTime = 0

  justStartedRotation = false
  justFinishedRotation = false
  isInRotation = false

  getState() {
    return {}
  }

  updateState(position: POSITION): void {
    let hasFinishedRotation = false
    let hasStartedRotation = false

    switch (position) {
      case POSITION.OVER:
        switch (this.state) {
          case STATE.OVER_STEADY:
            this.counterTime = Math.max(0, this.counterTime - 1)
            break
          case STATE.OVER_RISING:
            this.counterTime = Math.min(this.counterTime + 1, thresholdTime + 1)
            if (this.counterTime > thresholdTime) {
              this.state = STATE.OVER_STEADY
            }

            break
          case STATE.OVER_FALLING:
            this.counterTime = Math.min(this.counterTime + 1, thresholdTime + 1)
            if (this.counterTime > thresholdTime) {
              this.state = STATE.OVER_STEADY
            }

            break
          case STATE.INSIDE_STEADY:
            this.counterTime = 1
            this.state = STATE.OVER_RISING
            hasStartedRotation = true
            break
          default:
            hasFinishedRotation = true
            this.state = STATE.INSIDE_STEADY
        }

        break

      case POSITION.UNDER:
        switch (this.state) {
          case STATE.UNDER_STEADY:
            this.counterTime = Math.max(0, this.counterTime - 1)
            break
          case STATE.UNDER_RISING:
            this.counterTime = Math.min(this.counterTime + 1, thresholdTime + 1)
            if (this.counterTime > thresholdTime) {
              this.state = STATE.UNDER_STEADY
            }

            break
          case STATE.UNDER_FALLING:
            this.counterTime = Math.min(this.counterTime + 1, thresholdTime + 1)
            if (this.counterTime > thresholdTime) {
              this.state = STATE.UNDER_STEADY
            }

            break
          case STATE.INSIDE_STEADY:
            this.counterTime = 1
            this.state = STATE.UNDER_RISING
            hasStartedRotation = true
            break
          default:
            hasFinishedRotation = true
            this.state = STATE.INSIDE_STEADY
        }

        break

      case POSITION.INSIDE:
        switch (this.state) {
          case STATE.OVER_FALLING:
          case STATE.UNDER_FALLING:
            this.counterTime = Math.max(0, this.counterTime - 1)
            if (this.counterTime === 0) {
              hasFinishedRotation = true
              this.state = STATE.INSIDE_STEADY
            }

            break
          case STATE.OVER_RISING:
          case STATE.UNDER_RISING:
            this.counterTime = Math.max(0, this.counterTime - 1)
            if (this.counterTime === 0) {
              this.state = STATE.INSIDE_STEADY
            }

            break
          case STATE.OVER_STEADY:
            this.counterTime--
            this.state = STATE.OVER_FALLING
            break
          case STATE.UNDER_STEADY:
            this.counterTime--
            this.state = STATE.UNDER_FALLING
            break
          default:
            console.error("Unknown state")
        }

        break
      default:
        console.error("Unknown direction")
    }

    this.justFinishedRotation = hasFinishedRotation
    this.justStartedRotation = hasStartedRotation
    this.isInRotation = this.state !== STATE.INSIDE_STEADY
  }
}
