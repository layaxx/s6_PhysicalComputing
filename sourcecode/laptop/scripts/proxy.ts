import { SerialPort } from "serialport"
import { ReadlineParser } from "@serialport/parser-readline"
import { path, baudRate } from "../config.json"

/* WEBSOCKET Config */
import WebSocketServer from "ws"

const server = new WebSocketServer.Server({ port: 8080 })

const activeConnections: WebSocketServer.WebSocket[] = []

// Creating connection using websocket
server.on("connection", (ws) => {
    console.log("client connected")
    activeConnections.push(ws)

    ws.on("message", (data) => {
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
const port = new SerialPort({ path, baudRate })


function handleData(data: any) {
    console.log(
        `Received: ${data}, sending it to ${activeConnections.length} client(s)`
    )
    activeConnections.forEach((socket) => socket.send(data))
}

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }))
parser.on("data", handleData)
parser.on("error", console.error)

port.on("error", function (err) {
    console.log("Error: ", err.message)
})

port.on("end", () => console.log("Connection ended"))

setInterval(() => {
    if (!port.opening && !port.isOpen) {
        console.error("timeout detected")
        port.open()
    }
}, 1000)
