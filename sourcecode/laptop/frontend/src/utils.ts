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
  let set: string = "default"
  if (string.includes(": ")) {
    let rest: string[]
    ;[set, ...rest] = string.split(": ")
    string = rest.join(": ")
  }

  let number: number
  try {
    number = Number.parseFloat(string)
  } catch {
    number = 0
  }

  return { number, set }
}
