/* eslint-disable import/no-extraneous-dependencies */
import { SerialPort } from "serialport"
import dayjs from "dayjs"
import { ReadlineParser } from "@serialport/parser-readline"
import { path, baudRate } from "../config.json"

/* Serial Config */
const port = new SerialPort({ path, baudRate })

function getValue() {
  const date = dayjs()
  return date.hour() * 60 * 60 + date.minute() * 60 + date.second()
}

const nSeconds = 100

const map = new Map<string, { freq: number[]; values: number[] }>()

const startValue = getValue()

console.log(startValue)

function handleData(data: string) {
  const timestamp = getValue() - startValue

  const prefix = data.split(": ")[0] ?? "default"
  let object = map.get(prefix)

  if (!object) {
    object = { freq: [], values: [] }
    map.set(prefix, object)
  }

  object.freq[timestamp] = (object.freq[timestamp] ?? 0) + 1

  const value = Number.parseFloat((data.split(": ")[1] ?? "-1").trim())
  object.values.push(value)

  if (timestamp > nSeconds) {
    console.log("FINISHED")
    for (const [name, { freq: f, values: v }] of map.entries()) {
      const values = v.filter(Boolean)
      values.shift()
      values.pop()
      const freq = f.filter(Boolean)
      freq.shift()
      freq.pop()
      console.log("Results for " + name)
      console.log(JSON.stringify(freq))
      const amount = freq.reduce((a: number, b: number) => a + b, 0)
      console.log(
        amount / freq.length,
        "Values per second on average over",
        freq.length
      )
      const sum = values.reduce((a: number, b: number) => a + b, 0)
      const mean = sum / values.length
      const sd = Math.sqrt(
        values
          .map((x: number) => (x - mean) ** 2)
          .reduce((a: number, b: number) => a + b, 0) / values.length
      )

      const filtered = values.filter(
        (number: number) => Math.abs(number - mean) <= sd
      )
      console.log(
        filtered.reduce((a: number, b: number) => a + b, 0) / filtered.length,
        "average over",
        values.length
      )
    }

    // eslint-disable-next-line n/prefer-global/process
    global.process.exit()
  }
}

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }))
parser.on("data", handleData)
parser.on("error", console.error)

port.on("error", function (error) {
  console.log("Error:", error.message)
})

port.on("end", () => {
  console.log("Connection ended")
})

setInterval(() => {
  if (!port.opening && !port.isOpen) {
    console.error("timeout detected")
    port.open()
  }
}, 1000)
