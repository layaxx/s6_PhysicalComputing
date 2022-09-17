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

  draw(data: Array<{ x: number; y: number }>) {
    this.chart.data = {
      datasets: [
        {
          label: `${this.prefix}, every ${takeEveryNth}th`,
          data,
          backgroundColor: colors[0],
        },
      ],
    }
    this.chart.update("none")
  }
}

const defaultConfig: ChartConfiguration = {
  type: "scatter",
  data: {
    labels: [],
    datasets: [],
  },
  options: {
    animation: false,
  },
}
