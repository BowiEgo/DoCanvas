function createPoint(x = 0, y = 0) {
  return {
    x,
    y,
    setX: function (x) {
      this.x = x
    },
    setY: function (y) {
      this.y = y
    }
  }
}
