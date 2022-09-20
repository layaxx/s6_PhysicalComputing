import { PluginOptionsByType } from "chart.js"

declare module "chart.js" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface PluginOptionsByType<TType extends ChartType> {
    calibration: {
      stats: Array<{ mean: number; sd: number }>
    }
  }
}
