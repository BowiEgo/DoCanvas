export interface Bounds {
  add(x: number, y: number, w: number, h: number): void
}

export function createBounds(
  left: number,
  top: number,
  width: number,
  height: number
) {
  let bounds = {
    left,
    top,
    width,
    height,
    add(x, y, w, h) {
      return createBounds(
        bounds.left + x,
        bounds.top + y,
        bounds.width + w,
        bounds.height + h
      )
    }
  }

  return bounds
}
