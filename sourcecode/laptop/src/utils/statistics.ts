/**
 * Returns the mean of the given values
 *
 * @param data - array of numbers
 * @returns mean of values
 */
export function getAverage(data: number[]) {
  return data.length > 0 ? getSum(data) / data.length : 0
}

/**
 * Returns mean of values that are within factor * sd of the mean
 *
 * If mean and sd are not given, they will be calculated from the given data
 *
 * @param data - array of numbers
 * @param options - optional. if given, must contain mean and standard deviation. May contain factor, default is 2
 * @returns
 */
export function getAverageWithoutOutliers(
  data: number[],
  options?: { sd: number; mean: number; factor?: number }
) {
  let sd = options?.sd
  let mean = options?.mean
  if (options === undefined) {
    mean = getAverage(data)
    sd = getStandardDeviation(data, mean)
  }

  const factor = options?.factor ?? 2

  return getAverage(
    data.filter((datum) => Math.abs(datum - mean!) <= sd! * factor)
  )
}

/**
 * Returns the sum of an array of numbers.
 *
 * Returns 0 for empty array
 *
 * @param data - array of numbers
 * @returns - sum of array
 */
export function getSum(data: number[]) {
  return data.reduce((a, b) => a + b, 0)
}

/**
 * Calculates the Standard Deviation for the given data.
 * If mean is given, it will be used, otherwise mean will be calculated via getAverage()
 *
 * Returns 0 for empty array
 *
 * @param data - array of numbers
 * @param mean - optional: mean
 * @returns the standard deviation
 */
export function getStandardDeviation(data: number[], mean?: number) {
  if (mean === undefined) {
    mean = getAverage(data)
  }

  if (data.length === 0) {
    return 0
  }

  return Math.sqrt(
    getSum(data.map((datum) => (datum - mean!) ** 2)) / data.length
  )
}
