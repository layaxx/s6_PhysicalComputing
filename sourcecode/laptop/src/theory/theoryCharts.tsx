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
import { DBSCAN, KMEANS } from "density-clustering"
// eslint-disable-next-line n/file-extension-in-import
import { useRef } from "preact/hooks"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const colors = ["blue", "red", "green", "orange", "white", "black"]

export const options = {
  responsive: true,
}

export function Chart({ data }: { data: Array<{ x: number; y: number }> }) {
  const chart = useRef()

  const dbscan = new DBSCAN()

  // 3 clusters => C or T
  // 5 clusters => X
  // ??

  // distance between points with same x coordinate, data normalized 0 -> 1 / lowest -> largest

  // write about extensibility

  const clusters = dbscan.run(
    data.map(({ x, y }) => [x, y]),
    10,
    10
  )

  console.log(clusters.length)

  return (
    <>
      <Scatter
        ref={chart}
        options={options}
        data={{
          datasets: [
            {
              label: "Distance",
              data,
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
          ],
        }}
      />
      <Scatter
        ref={chart}
        options={options}
        data={{
          datasets: clusters.map((array, index) => ({
            label: "Cluster " + index,
            data: array.map((idx) => data[idx]),
            backgroundColor: colors[index],
          })),
        }}
      />

      <Scatter
        ref={chart}
        options={options}
        data={{
          datasets: [
            {
              label: "Distance",
              data: data.map(({ x, y }) => {
                const a = y * Math.sin(((x - 90) / 180) * Math.PI)
                const b = y * Math.cos(((x - 90) / 180) * Math.PI)

                return { x: a, y: b }
              }),
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
          ],
        }}
      />
      <button
        onClick={() => {
          console.log(chart.current.toBase64Image())
        }}
      >
        Print to console
      </button>
    </>
  )
}
