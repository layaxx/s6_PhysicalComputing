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
 * Since the sensor is rated for up to 4m, larger values will be capped at 4m
 * Note: Does not account for temperature.
 *
 * @param count - count received from Arduino clock
 * @returns estimated distance in meters
 */
export function convertToMeters(count: number) {
  const time = (count * 8) / 16_000_000
  return Math.min((time * 340) / 2, 4)
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

/**
 * Convert a data point from the Gyroscope sensor to an estimate of rotation speed
 *
 * Gyroscope is expected to be set to the +-250°/s range
 *
 * @param value - value from gyroscope
 * @returns estimated rotation speed in degrees per second
 */
export function convertToRotationSpeed(value: number) {
  const range = 250
  const uncapped = (value / 2 ** 15) * range
  return Math.max(Math.min(uncapped, range), -range)
}

/**
 * Convert a sum of data point from the Gyroscope sensor to an estimate of rotation distance
 *
 * Gyroscope is expected to be set to the +-250°/s range, update frequency is expected to be 31.5 Hz
 *
 * @param sum - value from gyroscope
 * @returns estimated distance in degrees
 */
export function convertRotationSumToAngle(sum: number) {
  const range = 250 // I.e. +-250°/s
  const frequency = 31.5 // Frequency of updates from MPU, empirically determined
  return ((sum / 2 ** 15) * range) / frequency
}

/**
 * Convert an angle to an estimate of the expected rotation sum
 *
 * Gyroscope is expected to be set to the +-250°/s range, update frequency is expected to be 31.5 Hz
 *
 * @param angle
 * @returns estimated sum of measurements
 */
export function convertAngleToRotationSum(angle: number) {
  const range = 250 // I.e. +-250°/s
  const frequency = 31.5 // Frequency of updates from MPU, empirically determined
  return (angle * frequency * 2 ** 15) / range
}
