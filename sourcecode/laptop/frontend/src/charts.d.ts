import { ChartTypeRegistry } from "chart.js"

declare module "chart.js" {
  interface ChartTypeRegistry {
    derivedLine: ChartTypeRegistry["line"]
  }
}
