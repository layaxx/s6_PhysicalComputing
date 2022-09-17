import { MyLiveChart } from "./charts"
import { isCorrectRotation, sdMultiplier } from "./config"
import RingBuffer from "./ringbuffer"
import { POSITION, StateMachine } from "./state"
import { MyStaticChart } from "./staticCharts"

export function liveplot(
  chart: MyLiveChart | undefined,
  prefix: string,
  numbers: number[]
) {
  if (!chart) {
    chart = new MyLiveChart(prefix, {
      average: 100,
      bufferSize: 10,
    })
  }

  chart.addDataPoint(numbers)
}

export function evaluateUltraSound(
  state: StateMachine,
  isCorrectRotation: boolean,
  USBuffer: RingBuffer<number[]>,
  data_: Array<number[]>,
  numbers: number[]
) {
  USBuffer.push(numbers)
  const { justStartedRotation, justFinishedRotation, isInRotation } = state

  if (justStartedRotation) {
    data_ = [...USBuffer.content] as Array<number[]>
  }
  if (isInRotation) {
    data_.push(numbers)
  }
  if (justFinishedRotation && isCorrectRotation) {
    data_.push(numbers)
    new MyStaticChart().draw(data_)
    console.log("DETECTION COMPLETED")
  }
}

export function determineRotation(
  chart: MyLiveChart | undefined,
  state: StateMachine,
  {
    prefix,
    rotationValue,
    areaUnderCurve,
  }: { prefix: string; rotationValue: number; areaUnderCurve: number }
): number {
  if (!chart) {
    chart = new MyLiveChart(prefix, {
      shouldCalibrate: true,
    })
  }

  if (chart.isCalibrated) {
    const { mean, sd } = chart.calibration[0]

    const upperBound = mean + sdMultiplier * sd
    const lowerBound = mean - sdMultiplier * sd

    const position =
      rotationValue > upperBound
        ? POSITION.OVER
        : rotationValue < lowerBound
        ? POSITION.UNDER
        : POSITION.INSIDE
    state.updateState(position)
    if (state.justStartedRotation) {
      areaUnderCurve = rotationValue
    }

    if (state.isInRotation) {
      areaUnderCurve += rotationValue
    }

    if (state.justFinishedRotation) {
      console.log("Detected Rotation")
      console.log(areaUnderCurve)
      if (isCorrectRotation(areaUnderCurve)) {
        console.log("Detected Correct Rotation")
        console.log({ areaUnderCurve })
      }
    }
  }

  chart.addDataPoint(
    [rotationValue],
    chart.isCalibrated ? state.state : undefined,
    false
  )

  return areaUnderCurve
}
