import "./style.css"
import RingBuffer from "./utils/ringbuffer"
import { prefixes } from "./utils/config"
import { determineRotation, evaluateUltraSound } from "./handler"
import { RotationClassifier } from "./classification/rotationClassifier"

// Setup DOM
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Paths in a Labyrinth</h1>
    <h2>Junction Classification</h2>
    <div>
      <a href="/theory.html">Theory and Visualizations</a>
    </div>
    <div>
      <h2>Status:</h2>
      <p id="connection-status">not connected</p>
      <p id="calibration-status">not calibrated</p>
      <button id="reconnect">Reconnect</button>
      <button id="disconnect">Disconnect</button>
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

const ultrasonicBuffer = new RingBuffer<number>(5)
let scanData: Array<{ x: number; y: number }> = []
const rotationClassifier = new RotationClassifier()

function connectToWebSocket() {
  const ws = new WebSocket("ws://localhost:8080")
  ws.addEventListener("open", () => {
    // Update DOM if connection is established
    const element = document.querySelector("#connection-status")!
    element.textContent = "connected"
    element.classList.add("connected")
    element.classList.remove("disconnected")
  })

  ws.addEventListener("close", () => {
    // Update DOM if connection is closed/lost
    const connectionStatus = document.querySelector("#connection-status")!
    connectionStatus.textContent =
      "disconnected [make sure proxy is running if this is unexpected]"
    connectionStatus.classList.remove("connected")
    connectionStatus.classList.add("disconnected")

    const calibrationStatus = document.querySelector("#calibration-status")!
    calibrationStatus.textContent = "not calibrated"
  })

  ws.addEventListener("message", function (event) {
    const data = String(event.data)

    if ([...data].some((char) => (char.codePointAt(0) ?? 128) > 127)) {
      // If non-ASCII characters are received, something probably went wrong during communication
      console.error("Received Non ASCII characters", event.data)
      return
    }

    // Split into Prefix and Payload
    const split = data.split(": ")
    const prefix = split.length > 1 ? split[0] : "default"
    const values = split.length > 1 ? split[1] : data

    if (/^\d.*/.test(prefix)) {
      console.warn("Received prefix starting with Number, ignoring", event.data)
      return
    }

    // Parse to Numbers
    let numbers: number[] = []
    try {
      numbers = values
        .split(" ")
        .map((value) => Number.parseFloat(value.trim()))
    } catch {
      console.warn("Failed to parse to Number, ignoring", event.data)
      return
    }

    // Handle Payload
    switch (prefix) {
      case prefixes.US:
        scanData = evaluateUltraSound(
          rotationClassifier,
          ultrasonicBuffer,
          scanData,
          numbers[0]
        )

        break

      case prefixes.gyro:
        determineRotation(rotationClassifier, numbers[0])
        break

      case prefixes.debug:
        console.warn("Received DEBUG message: " + data)
        break
      default:
        console.warn("Unknown prefix:", event.data)
    }
  })

  return ws
}

// Automatically connect to WebSocketServer
ws = connectToWebSocket()
