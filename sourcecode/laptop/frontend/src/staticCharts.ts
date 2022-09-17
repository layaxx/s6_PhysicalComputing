import { ChartConfiguration } from "chart.js"
import Chart from "chart.js/auto"
import { colors, takeEveryNth } from "./config"

export class MyStaticChart {
  chart: Chart
  prefix: string
  isCalibrated: boolean = false
  calibration: Array<{ mean: number; sd: number }> = []

  constructor(key: string = new Date().toISOString()) {
    this.prefix = key

    const container = document.getElementById("charts")
    const canvas = document.createElement("canvas")
    canvas.setAttribute("id", key)

    this.chart = new Chart(canvas, defaultConfig)
    container?.append(canvas)
  }

  draw(data: Array<number[]>) {
    this.chart.data = {
      labels: data.map((_, index) => index),
      datasets: Array(data[0].length)
        .fill(0)
        .map((_, idx) => ({
          label: `${this.prefix}, every ${takeEveryNth}th`,
          data: data.map((array, index) => ({
            x: index,
            y: array[idx],
          })),
          backgroundColor: colors[idx],
        })),
    }
    this.chart.update("none")
  }
}

const defaultConfig: ChartConfiguration = {
  type: "line",
  data: {
    labels: [],
    datasets: [],
  },
  options: {
    animation: false,
  },
}
