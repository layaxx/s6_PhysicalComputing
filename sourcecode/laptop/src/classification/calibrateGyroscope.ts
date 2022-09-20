import { LiveChart } from "../charts/liveChart"
import RingBuffer from "../ringbuffer"
import { getAverage, getStandardDeviation } from "../utils"

export class Calibration {
  #buffer: RingBuffer<number>
  isCalibrated = false
  calibration: { mean: number; sd: number } | undefined = undefined

  #chart: LiveChart | undefined

  constructor(bufferSize: number, shouldLivePlot = false) {
    this.#buffer = new RingBuffer(bufferSize)

    if (shouldLivePlot) {
      this.#chart = new LiveChart("Gyroscope", {
        shouldCalibrate: true,
        average: 1,
        bufferSize: 30,
      })
    }
  }

  calibrate() {
    const array = this.#buffer.content

    const mean = getAverage(array)
    const sd = getStandardDeviation(array, mean)

    this.calibration = { mean, sd }

    document.querySelector("#calibration-status")!.textContent = "calibrated"

    console.log("Finished Calibration for Gyroscope")
    this.isCalibrated = true
  }

  addDataPoint(number: number) {
    if (this.#buffer.content.length === this.#buffer.size - 1) {
      // Calibrate
      this.calibrate()
      this.#chart?.calibrate([this.calibration!])
    }

    this.#buffer.push(number)

    if (this.#chart) {
      this.#chart.addDataPoint([number])
    }
  }
}
