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
import { useRef } from "preact/hooks"
import type { ChartJSOrUndefined } from "react-chartjs-2/dist/types"
import { normalizeToDiscrete } from "../classification/classification"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export function Chart({ data }: { data: Array<{ x: number; y: number }> }) {
  const chart = useRef<ChartJSOrUndefined>()

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
          ],
        }}
      />

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
