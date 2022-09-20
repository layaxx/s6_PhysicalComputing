import type { Chart } from "chart.js"
import { sdMultiplier, colors } from "../../utils/config"

export const calibration = {
  id: "calibration",
  beforeDraw(
    chart: Chart,
    _args: unknown,
    options: { stats: Array<{ mean: number; sd: number }> }
  ) {
    const { ctx, scales } = chart

    const stats = options.stats

    ctx.save()
    stats.forEach(({ mean, sd }, index) => {
      const meanPixel = scales.y.getPixelForValue(mean) ?? 5
      const sdUpperPixel =
        scales.y.getPixelForValue(mean + sdMultiplier * sd) ?? 5
      const sdLowerPixel =
        scales.y.getPixelForValue(mean - sdMultiplier * sd) ?? 5

      ctx.strokeStyle = colors[index]
      ctx.lineWidth = 2
      ctx.strokeRect(0, meanPixel, chart.width, 0)

      ctx.strokeStyle = colors[index]
      ctx.lineWidth = 1
      ctx.strokeRect(0, sdUpperPixel, chart.width, 0)
      ctx.strokeRect(0, sdLowerPixel, chart.width, 0)
    })
    ctx.restore()
  },
  defaults: { stats: [] },
}
