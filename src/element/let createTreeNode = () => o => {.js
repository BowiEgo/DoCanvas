const pipe =
  (...fns) =>
  (x) => {
    return fns.reduce((y, f) => f(y), x)
  }

let createTreeNode = () => (o) => {
  let treeNode = {
    _children: [],
    set children(val) {
      this._children = val
    },
    get children() {
      return this._children || []
    },
    appendChild: function (child) {
      this._children.push(child)
    }
  }

  return treeNode
}

let createBaseElement = () => (o) => {
  return {
    ...o,
    _style: 0,
    set style(val) {
      this._style = val
    },
    get style() {
      return this._style
    }
  }
}

let createElement = function () {
  return pipe(createTreeNode(), createBaseElement())({})
}

let createBaseRenderObject = (element) => (o) => {
  return {
    ...o,
    element
  }
}

let createBaseRenderBox = (element) => (o) => {
  return {
    ...o,
    element,
    get style() {
      return o.element.style
    }
  }
}

let createBaseRenderBlock = (element) => (o) => {
  return {
    ...o,
    element,
    get computedStyle() {
      return o.style
    }
  }
}

let createRenderBlock = function (element) {
  return pipe(
    createBaseRenderObject(element),
    createBaseRenderBox(element),
    createBaseRenderBlock(element)
  )({})
}

let element = createElement()

let renderObject = createRenderBlock(element)

console.log(renderObject.computedStyle) // Output: true

// Modifying the value of element.a.style
element.style = 10

console.log(renderObject.computedStyle) // Output: true

element.style = 20

console.log(renderObject.computedStyle) // Output: true

console.log(element.children)

element.appendChild(1)

console.log(element.children)
