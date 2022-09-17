import { SerialPort } from "serialport"
import dayjs from "dayjs"
import { ReadlineParser } from "@serialport/parser-readline"
import { symlinkSync } from "fs"

/* Serial Config */
const port = new SerialPort({
  path: "/dev/ttyUSB0",
  baudRate: 19200,
})

function getValue() {
  const date = dayjs()
  return date.hour() * 60 * 24 + date.minute() * 60 + date.second()
}

const nSeconds = 100

const map = new Map()

let startValue = getValue()

console.log(startValue)

function handleData(data: string) {
  const timestamp = getValue() - startValue

  const prefix = data.split(": ")[0]
  let obj = map.get(prefix)
  if (!obj) {
    obj = { freq: [], values: [] }
    map.set(prefix, obj)
  }

  obj.freq[timestamp] = obj.freq[timestamp] ? obj.freq[timestamp] + 1 : 1
  const value = Number.parseFloat(data.split(": ")[1].trim())
  obj.values[timestamp] = obj.values[timestamp]
    ? obj.values[timestamp] + value
    : value

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
      console.log(values, freq)
      console.log(
        freq.reduce((a: number, b: number) => a + b, 0) / values.length,
        " Values per second on average over ",
        freq.length
      )
      console.log(
        values.reduce((a: number, b: number) => a + b, 0) / values.length,
        " average over ",
        values.length
      )
    }
    process.exit()
  }
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
