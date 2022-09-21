import { getAverage } from "../utils/statistics"
import referenceEmpiric from "./data/combined.json"

export enum JUNCTION {
  X = "X Junction",
  T = "T Junction",
  C = "Corridor",
}

export type NormalizedScanData = Array<{ x: number; y: number }>

export function classifyJunction(data: NormalizedScanData) {
  const result = [
    {
      type: JUNCTION.X,
      value: getNormalizedCorrelation(data, referenceEmpiric.x),
    },
    {
      type: JUNCTION.C,
      value: getNormalizedCorrelation(data, referenceEmpiric.c),
    },
    {
      type: JUNCTION.T,
      value: getNormalizedCorrelation(data, referenceEmpiric.t),
    },
  ]

  return result.sort((a, b) => b.value - a.value).map(({ type }) => type)
}

export function normalizeDataYValues(
  data: NormalizedScanData
): NormalizedScanData {
  const min = Math.min(...data.map(({ y }) => y))
  const max = Math.max(...data.map(({ y }) => y - min))

  return data.map(({ x, y }) => ({ x, y: (y - min) / max }))
}

export function normalizeToDiscrete(
  data: NormalizedScanData
): NormalizedScanData {
  return Array.from({ length: 180 }).map((_, index) => ({
    x: index,
    y: getAverage(
      normalizeDataYValues(data)
        .filter(({ x }) => Math.floor(Math.abs(x)) === index)
        .map(({ y }) => y)
    ),
  }))
}

function getNormalizedCorrelation(
  data: NormalizedScanData,
  reference: NormalizedScanData
) {
  const normalizedData = normalizeToDiscrete(data).map(({ y }) => y)
  const normalizedReference = reference.map(({ y }) => y) // Is already normalized

  const normalizedFilteredData = normalizedData.filter(
    (value, index) => Boolean(value) && Boolean(normalizedReference[index])
  )
  const normalizedFilteredReference = normalizedReference.filter(
    (value, index) => Boolean(value) && Boolean(normalizedData[index])
  )

  if (normalizedFilteredData.length !== normalizedFilteredReference.length) {
    console.error("Failed to get correlation due to inconsistent length")
    return 0
  }

  if (normalizedFilteredData.length < 40) {
    console.error(
      "Failed to get correlation due to insufficient data:",
      normalizedFilteredData.length
    )
    return 0
  }

  return calculateCorrelation(
    normalizedFilteredData,
    normalizedFilteredReference
  )
}

/**
 * Calculate the Correlation between two sequences
 * Loosely based on https://github.com/Bitvested/ta.js
 *
 * Length of sequences must be equal or an Error will be thrown
 *
 * @param sequence0: Sequence of numbers
 * @param sequence1: Sequence of numbers
 * @returns Correlation Factor between the two sequences
 */
function calculateCorrelation(sequence0: number[], sequence1: number[]) {
  if (sequence0.length !== sequence1.length) {
    throw new Error("Arrays of different length supplied to cor()")
  }

  const averages = [getAverage(sequence0), getAverage(sequence1)]

  let sumOfProducts = 0
  let sumSequence0 = 0
  let sumSequence1 = 0

  for (const [i, element] of sequence0.entries()) {
    const x = element - averages[0]
    const y = sequence1[i] - averages[1]
    sumOfProducts += x * y
    sumSequence0 += x ** 2
    sumSequence1 += y ** 2
  }

  const n = sequence0.length - 1
  sumSequence0 = Math.sqrt(sumSequence0 / n)
  sumSequence1 = Math.sqrt(sumSequence1 / n)

  return sumOfProducts / (n * sumSequence0 * sumSequence1)
}
