import referenceData from "../classification/data/combined.json"
import { Chart } from "./theoryChart"

export default function ReferenceData() {
  return (
    <div>
      <h2>Combined reference data</h2>
      <h3>T Junction</h3>
      <Chart data={referenceData.t} />

      <h3>X Junction</h3>
      <Chart data={referenceData.x} />

      <h3>Corridor</h3>
      <Chart data={referenceData.c} />
    </div>
  )
}
