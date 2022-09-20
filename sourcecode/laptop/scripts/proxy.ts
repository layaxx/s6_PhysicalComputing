/* eslint-disable import/no-extraneous-dependencies */
import { SerialPort } from "serialport"
import { ReadlineParser } from "@serialport/parser-readline"
import WebSocketServer from "ws"
import { path, baudRate } from "../config.json"

/* WEBSOCKET Config */
const server = new WebSocketServer.Server({ port: 8080 })

const activeConnections: WebSocketServer.WebSocket[] = []

// Creating connection using websocket
server.on("connection", (ws) => {
  console.log("client connected")
  activeConnections.push(ws)

  ws.on("message", (data: string) => {
    console.log(`Received data: ${data}`)
  })

  ws.on("close", () => {
    console.log("client disconnected")
    activeConnections.splice(activeConnections.indexOf(ws), 1)
  })

  ws.on("error", () => {
    console.log("Some Error occurred")
  })
})

/* Serial Config */
const serialPort = new SerialPort({ path, baudRate })

function handleData(data: string) {
  console.log(
    `Received: ${data}, sending it to ${activeConnections.length} client(s)`
  )
  activeConnections.forEach((socket) => {
    socket.send(data)
  })
}

const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\r\n" }))
parser.on("data", handleData)
parser.on("error", console.error)

serialPort.on("error", function (error) {
  console.log("Error:", error.message)
})

serialPort.on("end", () => {
  console.log("Connection ended")
})

setInterval(() => {
  if (!serialPort.opening && !serialPort.isOpen) {
    console.error("timeout detected")

    serialPort.open((error) => {
      if (error) {
        activeConnections.forEach((ws) => {
          ws.send(`Debug: Timeout: ${error?.message}`)
        })
        console.error(error)
      }
    })
  }
}, 1000)
