export interface Size {
  width: number
  height: number
  setWidth(width: number): void
  setHeight(height: number): void
  addWidth(width: number): void
  addHeight(height: number): void
}

export function createSize(width = 0, height = 0): Size {
  return {
    width,
    height,
    setWidth: function (width) {
      this.width = width
    },
    setHeight: function (height) {
      this.height = height
    },
    addWidth: function (addend) {
      this.width += addend
    },
    addHeight: function (addend) {
      this.height += addend
    }
  }
}
