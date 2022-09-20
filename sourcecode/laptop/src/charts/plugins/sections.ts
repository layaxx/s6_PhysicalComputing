import type { Chart } from "chart.js"

/**
 * Chart.js Plugin for drawing sections at for the corners and paths
 */
export const sections = {
  id: "sections",
  beforeDraw(
    chart: Chart,
    _args: unknown,
    colors: { corners: string; left: string; middle: string; right: string }
  ) {
    const { ctx, scales } = chart
    const lengthCorners = 20
    const lengthSections = lengthCorners * 2

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
