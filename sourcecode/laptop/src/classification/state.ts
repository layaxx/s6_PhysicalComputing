/* eslint-disable complexity */
import { STATE, thresholdTime } from "../utils/config"

export enum POSITION {
  OVER,
  UNDER,
  INSIDE,
}

export class StateMachine {
  state: STATE = STATE.INSIDE
  counterTime = 0

  justStartedRotation = false
  justFinishedRotation = false
  isInRotation = false

  updateState(position: POSITION): void {
    let hasFinishedRotation = false
    let hasStartedRotation = false

    switch (this.state) {
      case STATE.INSIDE:
        switch (position) {
          case POSITION.OVER:
            this.state = STATE.OVER
            this.counterTime = 1
            hasStartedRotation = true
            break
          case POSITION.UNDER:
            this.state = STATE.UNDER
            this.counterTime = 1
            hasStartedRotation = true
            break
          default: // Ignored
        }

        break
      case STATE.OVER:
        switch (position) {
          case POSITION.OVER:
            this.counterTime++
            if (this.counterTime > thresholdTime) {
              this.state = STATE.OVER_STEADY
            }

            break
          case POSITION.UNDER:
            this.state = STATE.INSIDE
            hasFinishedRotation = true
            break
          case POSITION.INSIDE:
            this.counterTime--
            if (this.counterTime <= 0) {
              this.state = STATE.INSIDE
              hasFinishedRotation = true
            }

            break
          default: // Ignored
        }

        break
      case STATE.OVER_STEADY:
        switch (position) {
          case POSITION.OVER:
            break
          case POSITION.UNDER:
            this.state = STATE.INSIDE
            hasFinishedRotation = true
            break
          case POSITION.INSIDE:
            this.counterTime--
            this.state = STATE.OVER
            break
          default: // Ignored
        }

        break

      case STATE.UNDER:
        switch (position) {
          case POSITION.OVER:
            this.state = STATE.INSIDE
            hasFinishedRotation = true
            break
          case POSITION.UNDER:
            this.counterTime++
            if (this.counterTime >= thresholdTime) {
              this.state = STATE.UNDER_STEADY
            }

            break
          case POSITION.INSIDE:
            this.counterTime--
            if (this.counterTime <= 0) {
              this.state = STATE.INSIDE
            }

            hasFinishedRotation = true
            break
          default: // Ignored
        }

        break
      case STATE.UNDER_STEADY:
        switch (position) {
          case POSITION.OVER:
            this.state = STATE.INSIDE
            hasFinishedRotation = true
            break
          case POSITION.UNDER:
            break
          case POSITION.INSIDE:
            this.counterTime--
            this.state = STATE.UNDER
            break
          default: // Ignored
        }

        break

      default:
    }

    this.justFinishedRotation = hasFinishedRotation
    this.justStartedRotation = hasStartedRotation
    this.isInRotation = this.state !== STATE.INSIDE
  }
}
