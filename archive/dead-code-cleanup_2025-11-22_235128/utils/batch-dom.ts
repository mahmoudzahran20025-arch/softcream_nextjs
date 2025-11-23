/**
 * Batch DOM operations to reduce layout thrashing.
 * Groups multiple DOM reads and writes to minimize reflows.
 */

let readQueue: (() => void)[] = []
let writeQueue: (() => void)[] = []
let isScheduled = false

function flush() {
  // Execute all reads first
  readQueue.forEach(fn => fn())
  readQueue = []

  // Then execute all writes
  writeQueue.forEach(fn => fn())
  writeQueue = []

  isScheduled = false
}

function schedule() {
  if (!isScheduled) {
    isScheduled = true
    requestAnimationFrame(flush)
  }
}

/**
 * Queue a DOM read operation
 * @param fn - Function that reads from DOM
 */
export function batchRead(fn: () => void): void {
  readQueue.push(fn)
  schedule()
}

/**
 * Queue a DOM write operation
 * @param fn - Function that writes to DOM
 */
export function batchWrite(fn: () => void): void {
  writeQueue.push(fn)
  schedule()
}

/**
 * Measure an element's dimensions
 * @param element - DOM element to measure
 * @returns Object with width, height, top, left, bottom, right
 */
export function measure(element: HTMLElement) {
  let rect: DOMRect | null = null

  batchRead(() => {
    rect = element.getBoundingClientRect()
  })

  return rect
}

/**
 * Update element styles
 * @param element - DOM element
 * @param styles - Object with style properties
 */
export function updateStyles(element: HTMLElement, styles: Record<string, string>) {
  batchWrite(() => {
    Object.assign(element.style, styles)
  })
}

/**
 * Flush all pending DOM operations immediately
 */
export function flushBatch() {
  if (isScheduled) {
    cancelAnimationFrame(0)
    flush()
  }
}
