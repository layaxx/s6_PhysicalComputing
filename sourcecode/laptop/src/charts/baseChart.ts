import type { ChartConfiguration } from "chart.js"
import Chart from "chart.js/auto"
import { colors } from "../utils/config"
import { sections } from "./plugins/sections"

/**
 * Basic chart for plotting data.
 * defaults to scatter plot
 */
export class BaseChart {
  prefix: string
  protected chart: Chart

  constructor(
    key: string = new Date().toISOString(),
    config: ChartConfiguration = getDefaultConfig()
  ) {
    this.prefix = key

    // Add containers
    const container = document.querySelector("#charts")
    const newContainer = document.createElement("div")

    // Add Button for printing Base64 representation of chart to console
    const buttonPrintImage = document.createElement("button")
    buttonPrintImage.textContent = "Print image"
    newContainer.append(buttonPrintImage)

    // Add Button for printing data of chart to console
    const buttonPrintData = document.createElement("button")
    buttonPrintData.textContent = "Print data"
    newContainer.append(buttonPrintData)

    // Add Button for removing chart and buttons from DOM
    const buttonDestroy = document.createElement("button")
    buttonDestroy.textContent = "Remove Chart"
    newContainer.append(buttonDestroy)

    // Create Chart
    const canvas = document.createElement("canvas")
    canvas.setAttribute("id", key)
    this.chart = new Chart(canvas, config)
    newContainer.append(canvas)
    container?.append(newContainer)

    // Setup event handlers for buttons
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

  /**
   * Plot one or more arrays of points
   *
   * @param datasets - one ore more arrays, each containing objects with x and y values
   */
  draw(...datasets: Array<Array<{ x: number; y: number }>>) {
    this.chart.data = {
      datasets: datasets.map((data, index) => ({
        label: `${this.prefix}`,
        data,
        backgroundColor: colors[index],
      })),
    }
    this.chart.update("none")
  }
}

/**
 * Factory for ChartConfig
 *
 * @param includeSections - boolean indicating whether the sections plugin should be enabled, defaults to true
 * @returns chart config
 */
const getDefaultConfig = (includeSections = true): ChartConfiguration => ({
  type: "scatter",
  data: {
    labels: [],
    datasets: [],
  },
  options: {
    animation: false,
  },
  plugins: includeSections ? [sections] : [],
})
