export default class RingBuffer<T> {
  size: number
  content: T[]

  constructor(size: number) {
    this.size = size
    this.content = []
  }

  push(element: T) {
    if (this.content.length >= this.size) {
      this.content.shift()
    }

    this.content.push(element)
  }
}
