import type { ChartConfiguration } from "chart.js"
import {
  bufferSize as bufferSizeDefault,
  colors,
  takeEveryNth,
} from "../config"
import RingBuffer from "../ringbuffer"
import { getAverage, getStandardDeviation } from "../utils"
import { BaseChart } from "./baseChart"
import { calibration } from "./plugins/calibration"

export const charts = new Map<string, LiveChart>()

export class LiveChart extends BaseChart {
  #buffer: RingBuffer<number[]>
  #states: RingBuffer<number>
  #prefix: string
  isCalibrated = false
  calibration: Array<{ mean: number; sd: number }> = []
  #shouldCalibrate: boolean
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
    super(key, defaultConfig)
    this.#prefix = key
    this.#shouldCalibrate = shouldCalibrate ?? false
    this.#average = average ?? 1
    this.#bufferSize = bufferSize ?? bufferSizeDefault
    this.#buffer = new RingBuffer(this.#bufferSize)
    this.#averageBuffer = new RingBuffer(this.#average)
    this.#states = new RingBuffer(this.#bufferSize)

    charts.set(key, this)
  }

  calibrate() {
    this.calibration = Array.from({
      length: this.#buffer.content[0].length,
    }).map((_, index) => {
      const array = this.#buffer.content.map((array) => array[index])

      const mean = getAverage(array)
      const sd = getStandardDeviation(array, mean)

      return { mean, sd }
    })

    console.log("Finished Calibration for", this.#prefix)
    this.isCalibrated = true
  }

  addDataPoint(number: number[], state = 0, shouldUpdate = true) {
    if (
      this.#shouldCalibrate &&
      this.#buffer.content.length === this.#buffer.size - 1
    ) {
      // Calibrate
      this.calibrate()
    }

    if (this.#average > 1) {
      this.#averageBuffer.push(number)
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
      this.#buffer.push(number)
      this.#states.push(state)
    }

    this.chart.data = {
      labels: this.#buffer.content.map((_, index) => index),
      datasets: Array.from({
        length: this.#buffer.content[0]?.length ?? 0,
      }).map((_, idx) => ({
        label: `${this.#prefix}, every ${takeEveryNth}th`,
        data: this.#buffer.content.map((array, index) => ({
          x: index,
          y: array[idx],
          color: colors[this.#states.content[index]],
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

    if (shouldUpdate) this.chart.update("none")
  }
}

const defaultConfig: ChartConfiguration = {
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
  plugins: [calibration],
}
