export interface Size {
  width: number
  height: number
  setWidth(width: number): void
  setHeight(height: number): void
}

export function createSize(): Size {
  return {
    width: 0,
    height: 0,
    setWidth: function (width) {
      this.width = width
    },
    setHeight: function (height) {
      this.height = height
    }
  }
}
