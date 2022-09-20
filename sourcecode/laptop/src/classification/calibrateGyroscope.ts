import { LiveChart } from "../charts/liveChart"
import RingBuffer from "../utils/ringbuffer"
import { getAverage, getStandardDeviation } from "../utils/statistics"

/**
 * Class for calibrating sensor data
 */
export class Calibration {
  #buffer: RingBuffer<number>
  isCalibrated = false
  calibration: { mean: number; sd: number } | undefined = undefined
  #chart: LiveChart | undefined

  constructor(bufferSize: number, shouldLivePlot = false) {
    this.#buffer = new RingBuffer(bufferSize)

    document.querySelector("#calibration-status")!.textContent = "calibrating"

    if (shouldLivePlot) {
      this.#chart = new LiveChart("Gyroscope", {
        shouldCalibrate: true,
        average: 1,
        bufferSize,
      })
    }
  }

  /**
   * Perform calibration, i.e. calculate mean and standard deviation for values in buffer
   */
  calibrate() {
    const array = this.#buffer.content

    const mean = getAverage(array)
    const sd = getStandardDeviation(array, mean)

    this.calibration = { mean, sd }

    document.querySelector("#calibration-status")!.textContent = "calibrated"

    console.log("Finished Calibration for Gyroscope")
    this.isCalibrated = true
  }

  /**
   * Add a reading point, perform calibration if buffer is full for first time
   *
   * Also adds point to live chart if one is set up.
   *
   * @param number
   */
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
