import type { ChartConfiguration } from "chart.js"
import Chart from "chart.js/auto"
import { colors, takeEveryNth } from "../config"
import { sections } from "./plugins/sections"

export class BaseChart {
  prefix: string
  protected chart: Chart

  constructor(
    key: string = new Date().toISOString(),
    config: ChartConfiguration = defaultConfig
  ) {
    this.prefix = key

    const container = document.querySelector("#charts")
    const newContainer = document.createElement("div")
    const button = document.createElement("button")
    button.textContent = "To Base64"
    newContainer.append(button)
    const canvas = document.createElement("canvas")
    canvas.setAttribute("id", key)

    this.chart = new Chart(canvas, defaultConfig)
    button.addEventListener("click", () => {
      console.log(this.chart.toBase64Image())
    })
    newContainer.append(canvas)
    container?.append(newContainer)
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
  plugins: [sections],
}
