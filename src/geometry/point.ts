export interface Point {
  x: number
  y: number
  setX(x: number): void
  setY(y: number): void
  moveX(distance: number): void
  moveY(distance: number): void
}

export function createPoint(x = 0, y = 0): Point {
  return {
    x,
    y,
    setX: function (x) {
      this.x = x
    },
    setY: function (y) {
      this.y = y
    },
    moveX: function (distance) {
      this.x += distance
    },
    moveY: function (distance) {
      this.y += distance
    }
  }
}
