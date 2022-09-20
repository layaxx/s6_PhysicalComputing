/* eslint-disable unicorn/filename-case */
/* eslint-disable guard-for-in */
/* eslint-disable @typescript-eslint/no-for-in-array */
export class Correlation {
  findConnection(
    series11: number[],
    series22: number[],
    tries?: number | undefined,
    start?: number | undefined,
    end?: number | undefined
  ) {
    let series1 = series11
    let series2 = series22
    if (typeof tries === "undefined") {
      tries = 10
    }

    if (typeof start === "undefined") {
      start = 0
    }

    if (typeof end === "undefined") {
      end = series1.length
    }

    series1 = series1.slice(start, end)
    series2 = series2.slice(start, end)

    let highestCorr = 0
    let whichRel = "diff"
    let bestOffset = 1
    for (let t = 1; t <= tries; t++) {
      const result = this.determineCorr(series1, series2, t)
      if (result.by > highestCorr) {
        highestCorr = result.by
        whichRel = result.results
        bestOffset = t
      }
    }

    return { offset: bestOffset, rel: whichRel, correlation: highestCorr }
  }

  determineCorr(
    series1: number[],
    series2: number[],
    offset: number | undefined
  ) {
    if (typeof offset === "undefined") {
      offset = 1
    }

    // Generate an array of when what
    const allCor = []

    for (const k in series1) {
      if (typeof series2[k] === "undefined") {
        break
      }

      const n = Number.parseInt(k, 10) + offset

      if (typeof series1[n] === "undefined") {
        break
      }

      const before1 = series1[k]
      const after1 = series1[n]

      const before2 = series2[k]
      const after2 = series2[n]

      const toAdd = this.whenWhat(before1, after1, before2, after2)
      allCor.push(toAdd)
    }

    return this.getCorrelation(allCor)
  }

  whenWhat(
    beforeF1: number,
    afterF1: number,
    beforeF2: number,
    afterF2: number
  ) {
    let whatHappend1 = "lost"
    let whatHappend2 = "lost"

    // eslint-disable-next-line unicorn/prefer-ternary
    if (beforeF1 >= afterF1) {
      whatHappend1 = "won"
      // Factor 1 increased or stayed same
    } else {
      // Factor 1 decreased
      whatHappend1 = "lost"
    }

    // eslint-disable-next-line unicorn/prefer-ternary
    if (beforeF2 >= afterF2) {
      whatHappend2 = "won"
      // Factor 2 increased or stayed same
    } else {
      whatHappend2 = "lost"
      // Factor 1 decreased
    }

    return [whatHappend1, whatHappend2]
  }

  getCorrelation(array: any[]) {
    const results = []
    for (const i in array) {
      if (array[i][0] === array[i][1]) {
        results.push("same")
      } else {
        results.push("diff")
      }
    }

    let sameNumber = 0
    let diffNumber = 0
    const all = results.length

    for (const j in results) {
      if (results[j] === "same") {
        sameNumber += 1
      } else {
        diffNumber += 1
      }
    }

    return diffNumber >= sameNumber
      ? { results: "diff", by: diffNumber / all }
      : { results: "same", by: sameNumber / all }
  }
}
