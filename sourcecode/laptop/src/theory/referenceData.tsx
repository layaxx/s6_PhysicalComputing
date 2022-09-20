import reference from "../classification/data/combined.json"
import { Chart } from "./theoryCharts"

export default function ReferenceData() {
  return (
    <div>
      <h2>Combined reference data</h2>
      <h3>T Junction</h3>
      <Chart data={reference.t} skip={true} />

      <h3>X Junction</h3>
      <Chart data={reference.x} skip={true} />

      <h3>Corridor</h3>
      <Chart data={reference.c} skip={true} />
    </div>
  )
}
