import { Point, createPoint } from './point'
import { Size } from './size'

export interface Rect {
  size: Size
  x: number
  y: number
  width: number
  height: number
  start: number
  end: number
  before: number
  after: number
  getCenter(rect: Rect): Point
}

export function createRect(location: Point, size: Size) {
  let rect = {
    get x() {
      return location.x
    },
    get y() {
      return location.y
    },
    get width() {
      return size.width
    },
    get height() {
      return size.height
    },
    get start() {
      return this.x
    },
    get end() {
      return this.x + this.width
    },
    get before() {
      return this.y
    },
    get after() {
      return this.y + this.height
    },
    get location() {
      return location
    },
    get size() {
      return size
    },
    getCenter
  }

  return rect
}

function getCenter(rect: Rect) {
  return createPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)
}
