import { sdMultiplier } from "../utils/config"
import { convertRotationSumToAngle } from "../utils/utils"
import { POSITION, StateMachine } from "./state"
import { Calibration } from "./calibrateGyroscope"

/**
 * Tracks the data for a rotation
 */
export class RotationClassifier {
  stateMachine: StateMachine
  rotationSum: number
  calibration: Calibration

  constructor() {
    this.stateMachine = new StateMachine()
    this.calibration = new Calibration(50, false)
    this.rotationSum = 0
  }

  isCorrectRotation() {
    const lowerBound = -210
    const upperBound = -170

    const angle = convertRotationSumToAngle(this.rotationSum)

    return lowerBound <= angle && angle <= upperBound
  }

  addDatapoint(datum: number) {
    if (this.calibration.isCalibrated) {
      datum -= this.calibration.calibration?.mean ?? 0

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
        this.rotationSum = datum
      }

      if (this.stateMachine.isInRotation) {
        this.rotationSum += datum
      }

      if (this.stateMachine.justFinishedRotation) {
        console.log("Detected Rotation", {
          angle: convertRotationSumToAngle(this.rotationSum),
        })
        if (this.isCorrectRotation()) {
          console.log("Detected Correct Rotation")
        }
      }
    } else {
      this.calibration.addDataPoint(datum)
    }

    return this.rotationSum
  }
}
