import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Scatter } from "react-chartjs-2"
// eslint-disable-next-line n/file-extension-in-import
import { useMemo, useRef } from "preact/hooks"
import type { ChartJSOrUndefined } from "react-chartjs-2/dist/types"
import {
  classifyJunction,
  normalizeToDiscrete,
} from "../classification/classification"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export function ClassificationChart({
  data,
}: {
  data: Array<{ x: number; y: number }>
}) {
  const chart = useRef<ChartJSOrUndefined>()

  const classification = useMemo(() => classifyJunction(data), data)

  const environment = data.map(({ x: angle, y: distance }) => {
    const x = distance * Math.cos((angle * Math.PI) / 180)
    const y = distance * -Math.sin((angle * Math.PI) / 180)

    return { x, y }
  })
  data = normalizeToDiscrete(data).filter(({ y }) => Boolean(y))

  return (
    <>
      <Scatter
        ref={chart}
        options={{
          responsive: true,
          animation: false,
        }}
        data={{
          datasets: [
            {
              label: "Distance",
              data,
              backgroundColor: "blue",
              yAxisID: "y",
              xAxisID: "x",
            },
            {
              label: "Environment",
              data: environment,
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132, 0.5)",
              yAxisID: "y1",
              xAxisID: "x1",
            },
          ],
        }}
      />

      <p>Classification: {classification[0]}</p>

      <button
        onClick={() => {
          console.log(chart.current?.toBase64Image())
        }}
      >
        Print to console
      </button>
    </>
  )
}
