import { BaseChart } from "./charts/baseChart"
import { classifyJunction } from "./classification/classification"
import { LiveChart } from "./charts/liveChart"
import { isCorrectRotation } from "./config"
import type RingBuffer from "./ringbuffer"
import type { StateMachine } from "./state"
import { convertToMeters } from "./utils"
import type { RotationClassifier } from "./classification/classifyRotation"

export function liveplot(
  chart: LiveChart | undefined,
  prefix: string,
  numbers: number[]
) {
  if (!chart) {
    chart = new LiveChart(prefix, {
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
    const normalizedData = data.map(({ x, y }) => ({
      x: (x / Math.abs(areaUnderCurve)) * 180,
      y: convertToMeters(y),
    }))
    new BaseChart().draw(normalizedData)

    console.log("DETECTION COMPLETED")

    console.log(classifyJunction(normalizedData))
    state.justFinishedRotation = false
  }

  return data
}

export function determineRotation(
  classifier: RotationClassifier,
  rotationValue: number
) {
  return classifier.addDatapoint(rotationValue)
}
