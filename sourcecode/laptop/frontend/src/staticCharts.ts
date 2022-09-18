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
    const newContainer = document.createElement("div")
    const button = document.createElement("button")
    button.textContent = "To Base64"
    newContainer.appendChild(button)
    const canvas = document.createElement("canvas")
    canvas.setAttribute("id", key)

    this.chart = new Chart(canvas, defaultConfig)
    button.addEventListener("click", () =>
      console.log(this.chart.toBase64Image())
    )
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

const sections = {
  id: "sections",
  beforeDraw: (
    chart: Chart,
    _args: unknown,
    colors: { corners: string; left: string; middle: string; right: string }
  ) => {
    const { ctx, scales } = chart
    const lengthCorners = 20
    const lengthSections = lengthCorners * 2

    console.log({
      lengthCorners,
      lengthSections,
      one: scales.x.getPixelForValue(45 - 5),
      x: scales,
    })

    ctx.save()
    ctx.globalCompositeOperation = "destination-over"
    ctx.globalAlpha = 0.2

    ctx.fillStyle = colors.corners
    ctx.fillRect(
      scales.x.getPixelForValue(45 - 5),
      0,
      lengthCorners,
      chart.height
    )

    ctx.fillStyle = colors.corners
    ctx.fillRect(
      scales.x.getPixelForValue(135 - 5),
      0,
      lengthCorners,
      chart.height
    )

    ctx.fillStyle = colors.left
    ctx.fillRect(scales.x.getPixelForValue(0), 0, lengthSections, chart.height)

    ctx.fillStyle = colors.middle
    ctx.fillRect(scales.x.getPixelForValue(85), 0, lengthSections, chart.height)

    ctx.fillStyle = colors.right
    ctx.fillRect(
      scales.x.getPixelForValue(170),
      0,
      lengthSections,
      chart.height
    )
    ctx.restore()
  },
  defaults: {
    corners: "lightGreen",
    left: "lightblue",
    middle: "lightblue",
    right: "lightblue",
  },
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
