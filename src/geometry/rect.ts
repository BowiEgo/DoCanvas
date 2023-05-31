import { Point, createPoint } from './point'
import { Size } from './size'

export interface Rect {
  location: Point
  size: Size
  x: number
  y: number
  getCenter(rect: Rect): Point
}

export function createRect(location, size) {
  let rect = {
    location,
    size,
    get x() {
      return location.x
    },
    get y() {
      return location.y
    },
    getCenter
  }

  return rect
}

function getCenter(rect) {
  return createPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)
}
