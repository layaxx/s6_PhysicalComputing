import "./style.css"
import RingBuffer from "./ringbuffer"
import { prefixes } from "./config"
import { charts } from "./charts"
import { StateMachine } from "./state"
import { determineRotation, evaluateUltraSound, liveplot } from "./handler"
import { convertToMeters } from "./utils"
import { MyStaticChart } from "./staticCharts"

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Serial Plotter</h1>
    <div>
      <h2>Connection Status:</h2>
      <p id="connection-status">not connected</p>
      <button id="reconnect">Reconnect</button>
      <button id="disconnect">Disconnect</button>
      <button id="calibrate">Calibrate</button>
    </div>
    <div class="card" id="log"></div>
    <div id="charts"></div>
  </div>
`

let ws: WebSocket | undefined

document.querySelector("#reconnect")?.addEventListener("click", () => {
  if (!ws || ws.CLOSED) {
    console.log("Reconnecting")
    ws = connectToWebSocket()
  } else {
    console.error("WebSocket already active")
  }
})
document.querySelector("#disconnect")?.addEventListener("click", () => {
  ws?.close()
})

const USBuffer = new RingBuffer<number>(5)
let data_: Array<{ x: number; y: number }> = []

let areaUnderCurve = 0
let state = new StateMachine()

function connectToWebSocket() {
  const ws = new WebSocket("ws://localhost:8080")
  ws.addEventListener("open", () => {
    const element = document.querySelector("#connection-status")!
    element.textContent = "connected"
    element.classList.add("connected")
    element.classList.remove("disconnected")
  })

  ws.addEventListener("close", () => {
    const element = document.querySelector("#connection-status")!
    element.textContent = "disconnected"
    element.classList.remove("connected")
    element.classList.add("disconnected")
  })

  ws.addEventListener("message", function (event) {
    if ([...event.data].some((char) => char.charCodeAt(0) > 127)) {
      console.error("Received Non ASCII characters", event.data)
      return
    }

    // Convert to Numbers
    const data = String(event.data)
    const split = data.split(": ")
    const prefix = split.length > 1 ? split[0] : "default"
    const values = split.length > 1 ? split[1] : data

    if (/^\d.*/.test(prefix)) {
      console.warn("Received prefix starting with Number, ignoring", event.data)
      return
    }

    let numbers: number[] = []
    try {
      numbers = values
        .split(" ")
        .map((value) => Number.parseFloat(value.trim()))
    } catch {
      console.warn("Failed to parse to Number, ignoring", event.data)
      return
    }

    let chart = charts.get(prefix)

    switch (prefix) {
      case prefixes.US:
        {
          if (numbers[0] > 45000) {
            numbers[0] = 0
            break
          }
          // liveplot(chart, prefix, numbers)
          data_ = evaluateUltraSound(
            state,
            areaUnderCurve,
            USBuffer,
            data_,
            numbers
          )
        }
        break
      case prefixes.gyro:
        {
          areaUnderCurve = determineRotation(chart, state, {
            prefix,
            rotationValue: numbers[0],
            areaUnderCurve,
          })
        }
        break
      default:
        console.warn("Unknown prefix: ", event.data)
    }
  })

  return ws
}

ws = connectToWebSocket()

document.querySelector("#calibrate")?.addEventListener("click", () => {
  for (const [_, chart] of charts.entries()) {
    chart.calibrate()
  }
})
