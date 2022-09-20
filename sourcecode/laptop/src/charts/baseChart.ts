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

    const buttonPrintImage = document.createElement("button")
    buttonPrintImage.textContent = "Print image"
    newContainer.append(buttonPrintImage)

    const buttonPrintData = document.createElement("button")
    buttonPrintData.textContent = "Print data"
    newContainer.append(buttonPrintData)

    const buttonDestroy = document.createElement("button")
    buttonDestroy.textContent = "Remove Chart"
    newContainer.append(buttonDestroy)

    const canvas = document.createElement("canvas")
    canvas.setAttribute("id", key)

    this.chart = new Chart(canvas, config)
    newContainer.append(canvas)
    container?.append(newContainer)

    buttonPrintImage.addEventListener("click", () => {
      console.log(this.chart.toBase64Image())
    })
    buttonPrintData.addEventListener("click", () => {
      console.log(this.chart.data)
    })
    buttonDestroy.addEventListener("click", () => {
      this.chart.destroy()
      container?.removeChild(newContainer)
    })
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
