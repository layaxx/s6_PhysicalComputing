import { isCorrectRotation, sdMultiplier } from "../utils/config"
import { POSITION, StateMachine } from "./state"
import { Calibration } from "./calibrateGyroscope"

/**
 * Tracks the data for a rotation
 */
export class RotationClassifier {
  stateMachine: StateMachine
  areaUnderCurve: number
  calibration: Calibration

  constructor() {
    this.stateMachine = new StateMachine()
    this.calibration = new Calibration(50, false)
    this.areaUnderCurve = 0
  }

  addDatapoint(datum: number) {
    if (this.calibration.isCalibrated) {
      const { mean, sd } = this.calibration.calibration!

      const upperBound = mean + sdMultiplier * sd
      const lowerBound = mean - sdMultiplier * sd

      const position =
        datum > upperBound
          ? POSITION.OVER
          : datum < lowerBound
          ? POSITION.UNDER
          : POSITION.INSIDE

      this.stateMachine.updateState(position)

      if (this.stateMachine.justStartedRotation) {
        this.areaUnderCurve = datum
      }

      if (this.stateMachine.isInRotation) {
        this.areaUnderCurve += datum
      }

      if (this.stateMachine.justFinishedRotation) {
        console.log("Detected Rotation")
        if (isCorrectRotation(this.areaUnderCurve)) {
          console.log("Detected Correct Rotation")
        }
      }
    } else {
      this.calibration.addDataPoint(datum)
    }

    return this.areaUnderCurve
  }
}
