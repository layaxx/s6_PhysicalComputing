/**
 * Buffer with fixed size
 */
export default class RingBuffer<T> {
  content: T[]

  constructor(public size: number) {
    this.content = []
  }

  /**
   * Add a value to buffer.
   * If buffer is at capacity, oldest element will be dropped
   *
   * @param element - element to be added
   */
  push(element: T) {
    if (this.content.length >= this.size) {
      this.content.shift()
    }

    this.content.push(element)
  }
}
