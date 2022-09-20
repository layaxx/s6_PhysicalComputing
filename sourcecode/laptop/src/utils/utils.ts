export function formatTime(input?: Date) {
  const date = input ?? new Date()

  return `${formatToNDigits(date.getDate(), 2)}.${formatToNDigits(
    date.getMonth(),
    2
  )}.${date.getFullYear()}-${formatToNDigits(
    date.getHours(),
    2
  )}:${formatToNDigits(date.getMinutes(), 2)}:${formatToNDigits(
    date.getSeconds(),
    2
  )}.${formatToNDigits(date.getMilliseconds(), 3)}`
}

export function formatToNDigits(number: number, digits: number) {
  return number.toLocaleString("en-US", {
    minimumIntegerDigits: digits,
  })
}

export function parseToNumber(string: string): {
  set: string
  number: number
} {
  let prefix = "default"
  if (string.includes(": ")) {
    let rest: string[]
    ;[prefix, ...rest] = string.split(": ")
    string = rest.join(": ")
  }

  let number: number
  try {
    number = Number.parseFloat(string)
  } catch {
    number = 0
  }

  return { number, set: prefix }
}

export function convertToMeters(count: number) {
  const time = (count * 8) / 16_000_000
  return (time * 340) / 2
}

export function convertToCentimeters(count: number) {
  return convertToMeters(count) * 100
}

export function getAverage(data: number[]) {
  return data.length > 0 ? getSum(data) / data.length : 0
}

export function getAverageWithoutOutliers(
  data: number[],
  stats?: { sd: number; mean: number; factor?: number }
) {
  let sd = stats?.sd
  let mean = stats?.mean
  if (stats === undefined) {
    mean = getAverage(data)
    sd = getStandardDeviation(data, mean)
  }

  const factor = stats?.factor ?? 2

  return getAverage(
    data.filter((datum) => Math.abs(datum - mean!) < sd! * factor)
  )
}

export function getSum(data: number[]) {
  return data.reduce((a, b) => a + b, 0)
}

export function getStandardDeviation(data: number[], mean?: number) {
  if (mean === undefined) {
    mean = getAverage(data)
  }

  return Math.sqrt(
    data.map((datum) => (datum - mean!) ** 2).reduce((a, b) => a + b) /
      data.length
  )
}
