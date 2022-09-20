import type { ChartConfiguration } from "chart.js"
import { defaultBufferSize as bufferSizeDefault, colors } from "../utils/config"
import RingBuffer from "../utils/ringbuffer"
import { BaseChart } from "./baseChart"
import { calibration } from "./plugins/calibration"

export const charts = new Map<string, LiveChart>()

/**
 * Chart for live plotting data
 */
export class LiveChart extends BaseChart {
  #buffer: RingBuffer<number[]>
  #prefix: string
  isCalibrated = false
  calibration: Array<{ mean: number; sd: number }> = []
  #averageBuffer: RingBuffer<number[]>
  #average: number
  #averageCounter = 0
  #bufferSize: number

  constructor(
    key: string,
    {
      shouldCalibrate,
      average,
      bufferSize,
    }: {
      shouldCalibrate?: boolean
      average?: number
      bufferSize?: number
    }
  ) {
    super(key, getDefaultConfig(shouldCalibrate))
    this.#prefix = key
    this.#average = average ?? 1
    this.#bufferSize = bufferSize ?? bufferSizeDefault
    this.#buffer = new RingBuffer(this.#bufferSize)
    this.#averageBuffer = new RingBuffer(this.#average)

    charts.set(key, this)
  }

  calibrate(calibration: Array<{ mean: number; sd: number }>) {
    this.calibration = calibration
    this.isCalibrated = true
  }

  /**
   * Add a value for each line in the graph
   *
   * @param values - array of numbers. length should equal amount of lines in chart
   */
  addDataPoint(values: number[]) {
    if (this.#average > 1) {
      this.#averageBuffer.push(values)
      this.#averageCounter++
      if (this.#averageCounter % this.#average === 0) {
        const averagedValues = Array.from({
          length: this.#averageBuffer.content[0].length,
        }).map((_, index) => {
          return (
            this.#averageBuffer.content.reduce(
              (previous, curr) => previous + curr[index],
              0
            ) / this.#average
          )
        })
        this.#buffer.push(averagedValues)
        this.#averageCounter = 1
      }
    } else {
      this.#buffer.push(values)
    }

    this.chart.data = {
      labels: this.#buffer.content.map((_, index) => index),
      datasets: Array.from({
        length: this.#buffer.content[0]?.length ?? 0,
      }).map((_, idx) => ({
        label: `${this.#prefix}, every ${this.#average}th`,
        data: this.#buffer.content.map((array, index) => ({
          x: index,
          y: array[idx],
          color: colors[index],
        })),
        backgroundColor(ctx: { raw: any }) {
          return (ctx?.raw?.color || colors[idx]) as string
        },
        normalized: true,
        parsing: false,
      })),
    }

    if (this.chart.options.plugins) {
      this.chart.options.plugins.calibration = {
        stats: this.isCalibrated ? this.calibration : [],
      }
    } else {
      this.chart.options.plugins = {
        calibration: {
          stats: this.isCalibrated ? this.calibration : [],
        },
      }
    }

    this.chart.update("none")
  }
}

const getDefaultConfig = (shouldCalibrate = false): ChartConfiguration => {
  return {
    type: "line",
    data: {
      labels: [],
      datasets: [],
    },
    options: {
      plugins: {},
      scales: {
        x: {
          ticks: { minRotation: 0, maxRotation: 0, sampleSize: 1 },
          min: 0,
          max: 50,
        },
        y: { ticks: { minRotation: 0, maxRotation: 0, sampleSize: 1 } },
      },
      animation: false,
    },
    plugins: shouldCalibrate ? [calibration] : [],
  }
}
