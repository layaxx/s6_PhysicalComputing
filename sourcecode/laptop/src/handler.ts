import { BaseChart } from "./charts/baseChart"
import { charts, LiveChart } from "./charts/liveChart"
import type RingBuffer from "./utils/ringbuffer"
import { convertToMeters } from "./utils/utils"
import type { RotationClassifier } from "./classification/rotationClassifier"
import {
  classifyJunction,
  normalizeDataYValues,
} from "./classification/classification"

/**
 * Handler that can be used to plot values as they come in.
 *
 * Uses existing chart for given prefix or creates new one of none is found
 * Due to potential performance impact, average over 100 values is plotted
 *
 * @param prefix
 * @param numbers
 */
export function liveplot(prefix: string, numbers: number[]) {
  let chart = charts.get(prefix)
  if (!chart) {
    chart = new LiveChart(prefix, {
      average: 100,
      bufferSize: 10,
    })
  }

  chart.addDataPoint(numbers.map((count) => convertToMeters(count) * 100))
}

/**
 * Handler for new Ultrasonic reading point
 *
 * @param classifier
 * @param ultrasonicBuffer
 * @param data
 * @param numbers
 * @returns
 */
export function evaluateUltraSound(
  classifier: RotationClassifier,
  ultrasonicBuffer: RingBuffer<number>,
  data: Array<{ x: number; y: number }>,
  number: number
) {
  ultrasonicBuffer.push(number)
  const { justStartedRotation, justFinishedRotation, isInRotation } =
    classifier.stateMachine

  if (justStartedRotation) {
    // If rotation was just started, convert Buffer to data points
    data = ultrasonicBuffer.content.map((value, index) => ({
      x: index,
      y: value,
    }))
  }

  if (isInRotation) {
    // During rotation, add data points
    data.push({ x: Math.abs(classifier.rotationSum), y: number })
  }

  if (justFinishedRotation && classifier.isCorrectRotation()) {
    // Correct Rotation was detected: add Chart to DOM and classify Junction
    data.push({ x: Math.abs(classifier.rotationSum), y: number })

    const normalizedData = data.map(({ x, y }) => ({
      x: (x / Math.abs(classifier.rotationSum)) * 180,
      y: convertToMeters(y),
    }))

    const classification = classifyJunction(normalizedData)

    console.log("Classification completed", classification)

    new BaseChart("Detected " + classification[0]).draw(
      normalizeDataYValues(normalizedData)
    )

    classifier.stateMachine.justFinishedRotation = false
  }

  return data
}

/**
 * Handler for Rotation data
 *
 * @param classifier
 * @param rotationValue
 * @returns
 */
export function determineRotation(
  classifier: RotationClassifier,
  rotationValue: number
) {
  return classifier.addDatapoint(rotationValue)
}
