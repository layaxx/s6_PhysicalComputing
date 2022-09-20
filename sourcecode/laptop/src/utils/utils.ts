/**
 * Returns a formatted string representation of the given DateTime
 *
 * defaults to current now.
 *
 * @param input - optional Date to be formatted
 * @returns string
 */
export function formatTime(input?: Date) {
  const date = input ?? new Date()

  return `${formatToNDigits(date.getDate(), 2)}.${formatToNDigits(
    date.getMonth() + 1,
    2
  )}.${date.getFullYear()}-${formatToNDigits(
    date.getHours(),
    2
  )}:${formatToNDigits(date.getMinutes(), 2)}:${formatToNDigits(
    date.getSeconds(),
    2
  )}.${formatToNDigits(date.getMilliseconds(), 3)}`
}

/**
 * Converts the given value to a string where the value is
 * formatted to (at least) the given number of digits
 *
 * @param number
 * @param digits
 * @returns string representation with at least the given amount of digits
 */
export function formatToNDigits(number: number, digits: number) {
  return number.toLocaleString("en-US", {
    minimumIntegerDigits: digits,
  })
}

/**
 * Convert a data point from the Ultrasonic sensor to a distance estimate
 *
 * Note: Does not account for temperature.
 *
 * @param count - count received from Arduino clock
 * @returns estimated distance in meters
 */
export function convertToMeters(count: number) {
  const time = (count * 8) / 16_000_000
  return (time * 340) / 2
}

/**
 * Convert a data point from the Ultrasonic sensor to a distance estimate
 *
 * Note: Does not account for temperature.
 *
 * @param count - count received from Arduino clock
 * @returns estimated distance in centimeters
 */
export function convertToCentimeters(count: number) {
  return convertToMeters(count) * 100
}
