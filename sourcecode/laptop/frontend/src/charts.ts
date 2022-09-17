import { ChartConfiguration, LineController } from "chart.js"
import Chart from "chart.js/auto"
import {
  bufferSize as bufferSizeDefault,
  colors,
  sdMultiplier,
  takeEveryNth,
} from "./config"
import RingBuffer from "./ringbuffer"
import { MyStaticChart } from "./staticCharts"

export const charts = new Map<string, MyLiveChart>()

class Custom extends LineController {
  draw() {
    // Now we can do some custom drawing for this dataset. Here we'll draw a red box around the first point in each dataset
    const meta = this.getMeta()
    const stats: Array<{ mean: number; sd: number }> =
      this.chart.data.stats ?? []
    const ctx = this.chart.ctx

    ctx.save()
    stats.forEach(({ mean, sd }, index) => {
      const meanPixel = meta.yScale?.getPixelForValue(mean) ?? 5
      const sdUpperPixel =
        meta.yScale?.getPixelForValue(mean + sdMultiplier * sd) ?? 5
      const sdLowerPixel =
        meta.yScale?.getPixelForValue(mean - sdMultiplier * sd) ?? 5

      ctx.strokeStyle = colors[index]
      ctx.lineWidth = 2
      ctx.strokeRect(0, meanPixel, this.chart.width, 0)

      ctx.strokeStyle = colors[index]
      ctx.lineWidth = 1
      ctx.strokeRect(0, sdUpperPixel, this.chart.width, 0)
      ctx.strokeRect(0, sdLowerPixel, this.chart.width, 0)
    })
    ctx.restore()

    super.draw()
  }
}
Custom.id = "derivedLine"
Custom.defaults = LineController.defaults

// Stores the controller so that the chart initialization routine can look it up
Chart.register(Custom)

export class MyLiveChart {
  #chart: Chart
  #buffer: RingBuffer<number[]>
  #states: RingBuffer<number>
  #prefix: string
  isCalibrated: boolean = false
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
    this.#prefix = key
    this.#shouldCalibrate = shouldCalibrate ?? false
    this.#average = average ?? 1
    this.#bufferSize = bufferSize ?? bufferSizeDefault

    const container = document.getElementById("charts")
    const canvas = document.createElement("canvas")
    canvas.setAttribute("id", key)

    this.#buffer = new RingBuffer(this.#bufferSize)
    this.#averageBuffer = new RingBuffer(this.#average)
    this.#states = new RingBuffer(this.#bufferSize)
    this.#chart = new Chart(canvas, defaultConfig)
    charts.set(key, this)

    container?.append(canvas)
  }

  calibrate() {
    this.calibration = Array(this.#buffer.content[0].length)
      .fill(0)
      .map((_, index) => {
        const array = this.#buffer.content.map((array) => array[index])
        const mean = array.reduce((a, b) => a + b, 0) / array.length

        const sd = Math.sqrt(
          array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) /
            array.length
        )

        return { mean, sd }
      })

    console.log("Finished Calibration for", this.#prefix)
    this.isCalibrated = true
  }

  addDataPoint(number: number[], state: number = 0, shouldUpdate = true) {
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
        const averagedValues = Array(this.#averageBuffer.content[0].length)
          .fill(0)
          .map((_, index) => {
            return (
              this.#averageBuffer.content.reduce(
                (prev, curr) => prev + curr[index],
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
    this.#chart.data = {
      labels: this.#buffer.content.map((_, index) => index),
      datasets: Array(this.#buffer.content[0]?.length ?? 0)
        .fill(0)
        .map((_, idx) => ({
          label: `${this.#prefix}, every ${takeEveryNth}th`,
          data: this.#buffer.content.map((array, index) => ({
            x: index,
            y: array[idx],
            color: colors[this.#states.content[index]],
          })),
          backgroundColor: (ctx: { raw: { color: any } }) => {
            return ctx?.raw?.color || colors[idx]
          },
          normalized: true,
          parsing: false,
        })),
      stats: this.isCalibrated ? this.calibration : [],
    }
    shouldUpdate && this.#chart.update("none")
  }
}

const defaultConfig: ChartConfiguration = {
  type: "derivedLine",
  data: {
    labels: [],
    datasets: [],
  },
  options: {
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
}
