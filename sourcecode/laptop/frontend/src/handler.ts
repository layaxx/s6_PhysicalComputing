import { MyLiveChart } from "./charts"
import { isCorrectRotation, sdMultiplier } from "./config"
import type RingBuffer from "./ringbuffer"
import type { StateMachine } from "./state"
import { POSITION } from "./state"
import { MyStaticChart } from "./staticCharts"
import { convertToMeters } from "./utils"

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

  chart.addDataPoint(numbers.map((count) => convertToMeters(count) * 100))
}

export function evaluateUltraSound(
  state: StateMachine,
  areaUnderCurve: number,
  ultrasonicBuffer: RingBuffer<number>,
  data: Array<{ x: number; y: number }>,
  numbers: number[]
) {
  ultrasonicBuffer.push(numbers[0])
  const { justStartedRotation, justFinishedRotation, isInRotation } = state

  if (justStartedRotation) {
    data = ultrasonicBuffer.content.map((value, index) => ({
      x: index,
      y: value,
    }))
  }

  if (isInRotation) {
    data.push({ x: Math.abs(areaUnderCurve), y: numbers[0] })
  }

  if (justFinishedRotation && isCorrectRotation(areaUnderCurve)) {
    data.push({ x: Math.abs(areaUnderCurve), y: numbers[0] })
    new MyStaticChart().draw(
      data.map(({ x, y }) => ({
        x: (x / Math.abs(areaUnderCurve)) * 180,
        y: convertToMeters(y),
      }))
    )

    console.log("DETECTION COMPLETED")
    state.justFinishedRotation = false
  }

  return data
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
