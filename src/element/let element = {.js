const pipe =
  (...fns) =>
  (x) => {
    return fns.reduce((y, f) => f(y), x)
  }

let element = {
  a: {
    _top: 0,
    get top() {
      return this._top
    },
    set top(val) {
      this._top = val
    }
  }
}

let createBaseRenderObject = (element) => (o) => {
  return {
    ...o,
    element,
    getA() {
      return this.element.a
    }
  }
}

let createBaseRenderBox = (element) => (o) => {
  return {
    ...o,
    element,
    get top() {
      return this.element.a.top
    },
    set top(val) {
      console.log(val)
    }
  }
}

let createBaseRenderBlock = () => (o) => {
  return o
}

let createRenderBlock = function (element) {
  return pipe(
    createBaseRenderObject(element),
    createBaseRenderBox(element),
    createBaseRenderBlock()
  )({})
}

element.renderObject = createRenderBlock(element)

console.log(element.renderObject.top) // Output: true

// Modifying the value of element.a.top
element.a.top = 10

console.log(element.renderObject.top) // Output: true
