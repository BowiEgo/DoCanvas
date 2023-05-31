export function createSize() {
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
