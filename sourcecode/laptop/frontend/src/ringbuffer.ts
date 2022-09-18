export default class RingBuffer<T> {
  size: number
  content: T[]

  constructor(sizeParameter: number) {
    this.size = sizeParameter
    this.content = []
  }

  push(element: T) {
    if (this.content.length >= this.size) {
      this.content.shift()
    }

    this.content.push(element)
  }
}
