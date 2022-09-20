// eslint-disable-next-line n/file-extension-in-import
import { useState } from "preact/hooks"
import { Chart } from "./theoryCharts"

export default function ExpectedData() {
  const [xOffset, setXOffset] = useState(50)
  const [yOffset, setYOffset] = useState(50)
  const [lineLength, setLineLength] = useState(250)

  const robot = { x: 600, y: 600, width: 10 }
  const width = 250
  const offset = { x: xOffset, y: yOffset }
  const leftElement = {
    x: { lower: robot.x - width - offset.x, upper: robot.x - offset.x },
    y: { lower: robot.y - width - offset.y, upper: robot.y - offset.y },
  }
  const rightElement = {
    x: { lower: robot.x + offset.x, upper: robot.x + width + offset.x },
    y: { lower: robot.y - width - offset.y, upper: robot.y - offset.y },
  }
  const angleStart = 0
  const angleOffset = -1.2
  const angleLimit = 180

  const lines = []
  const data = []

  for (
    let i = angleStart;
    Math.abs(i) <= angleLimit;
    i = (i + angleOffset) % 360
  ) {
    const a = lineLength * Math.sin(((i + 90) / 180) * Math.PI)
    const b = lineLength * Math.cos(((i + 90) / 180) * Math.PI)

    const endpoint = { x: robot.x - a, y: robot.y - b }

    if (
      (endpoint.x > leftElement.x.lower &&
        endpoint.x < leftElement.x.upper &&
        endpoint.y > leftElement.y.lower &&
        endpoint.y < leftElement.y.upper) ||
      (endpoint.x < leftElement.x.upper && endpoint.y < leftElement.y.upper)
    ) {
      const t = Math.min(
        (leftElement.x.upper - endpoint.x) / (robot.x - endpoint.x),
        (leftElement.y.upper - endpoint.y) / (robot.y - endpoint.y)
      )

      endpoint.x = t * robot.x + (1 - t) * endpoint.x
      endpoint.y = t * robot.y + (1 - t) * endpoint.y
    }

    if (
      (endpoint.x > rightElement.x.lower &&
        endpoint.x < rightElement.x.upper &&
        endpoint.y > rightElement.y.lower &&
        endpoint.y < rightElement.y.upper) ||
      (endpoint.x > rightElement.x.lower && endpoint.y < leftElement.y.upper)
    ) {
      const t = Math.min(
        (rightElement.x.lower - endpoint.x) / (robot.x - endpoint.x),
        (rightElement.y.upper - endpoint.y) / (robot.y - endpoint.y)
      )

      endpoint.x = t * robot.x + (1 - t) * endpoint.x
      endpoint.y = t * robot.y + (1 - t) * endpoint.y
    }

    data.push({
      x: i + angleStart,
      y: Math.sqrt((robot.x - endpoint.x) ** 2 + (robot.y - endpoint.y) ** 2),
    })
    lines.push(
      <line
        x1={robot.x}
        y1={robot.y}
        x2={endpoint.x}
        y2={endpoint.y}
        style="fill:none;stroke:black;stroke-width:1"
      />
    )
  }

  return (
    <>
      <div class="card">
        <div>
          <label>
            X Offset
            <input
              type="range"
              onChange={(event) => {
                setXOffset(Number((event.target as HTMLInputElement).value))
              }}
              value={xOffset}
              min={0}
              max={100}
            />
          </label>
          <span>{xOffset}</span>
        </div>
        <div>
          <label>
            Y Offset
            <input
              type="range"
              onChange={(event) => {
                setYOffset(Number((event.target as HTMLInputElement).value))
              }}
              value={yOffset}
              min={-100}
              max={100}
            />
          </label>
          <span>{yOffset}</span>
        </div>
        <div>
          <label>
            Line Length
            <input
              type="range"
              onChange={(event) => {
                setLineLength(Number((event.target as HTMLInputElement).value))
              }}
              value={lineLength}
              min={0}
              max={250}
            />
          </label>
          <span>{lineLength}</span>
        </div>
        <div>Path width: {xOffset * 2}</div>
      </div>
      <svg id="canvas" width="1200" height="800">
        <rect
          x={robot.x - robot.width / 2}
          y={robot.y - robot.width / 2}
          width={robot.width}
          height={robot.width}
        />

        {lines}

        <polyline
          points={`${leftElement.x.lower},${leftElement.y.upper} ${leftElement.x.upper},${leftElement.y.upper} ${leftElement.x.upper},${leftElement.y.lower}`}
          style="fill:none;stroke:red;stroke-width:5"
        />
        <polyline
          points={`${rightElement.x.lower},${rightElement.y.lower} ${rightElement.x.lower},${rightElement.y.upper} ${rightElement.x.upper},${rightElement.y.upper}`}
          style="fill:none;stroke:red;stroke-width:5"
        />
      </svg>
      <Chart data={data}></Chart>
      <svg width={600} height={400}>
        {data.map(({ x, y }) => {
          const center = { x: 300, y: 300 }
          const a = y * Math.sin(((x - 90) / 180) * Math.PI)
          const b = y * Math.cos(((x - 90) / 180) * Math.PI)
          return (
            <line
              x1={center.x}
              y1={center.y}
              x2={center.x + a}
              y2={center.y + b}
              style="fill:none;stroke:black;stroke-width:1"
            />
          )
        })}
      </svg>
    </>
  )
}
