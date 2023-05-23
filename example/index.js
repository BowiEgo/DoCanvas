const { createDoCanvas } = XCanvas

function initCanvas() {
  const canvas = document.querySelector('#canvas')
  canvas.style.display = 'block'

  const _ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio
  const _w = window.innerWidth
  const _h = window.innerHeight / 2
  canvas.width = _w * dpr
  canvas.height = _h * dpr

  console.log(_ctx, dpr, _w, _h)

  _ctx.scale(dpr, dpr)

  const DoCanvas = createDoCanvas({
    canvas,
    ctx: _ctx,
    dpr,
    width: _w,
    height: _h,
    backgroundColor: '#fff',
    debug: false
  })

  const elm = DoCanvas.createElement('view')
  const childElm1 = DoCanvas.createElement('view', {
    style: {
      color: 'red',
      textAlign: 'center',
      backgroundColor: '#00aeec45',
      width: 200,
      height: 100,
      marginTop: 40
    }
  })
  const childElm2 = DoCanvas.createElement('view', {
    style: {
      backgroundColor: 'green',
      width: 50,
      height: 120
    }
  })
  const textElm = DoCanvas.createElement(
    'text',
    { style: { fontSize: 16 } },
    'Hello 👨‍👩‍👧‍👦!Lorem ipsum dolor, 这是一段中文. Iure aliquam ea obcaecati quo corrupti saepe quas reiciendis. Incidunt ducimus blanditiis vero id natus. Numquam, neque voluptatem sapiente dolorum accusantium at?'
  )

  childElm1.appendChild(textElm)
  elm.appendChild(childElm1)
  elm.appendChild(childElm2)
  DoCanvas.body.appendChild(elm)

  console.log(elm.node.instance, elm)
  console.log(childElm1.container === elm)
}

function initHTMLELement() {
  const canvas = document.querySelector('#canvas')
  const elm = document.createElement('div')
  const childElm1 = document.createElement('div')
  const childElm2 = document.createElement('div')
  const textElm = document.createElement('p')
  const text = document.createTextNode(
    'Hello 👨‍👩‍👧‍👦!Lorem ipsum dolor, 这是一段中文. Iure aliquam ea obcaecati quo corrupti saepe quas reiciendis. Incidunt ducimus blanditiis vero id natus. Numquam, neque voluptatem sapiente dolorum accusantium at?'
  )

  elm.style = `height: ${
    window.innerHeight / 2
  }px; border-bottom: 1px solid #000;box-sizing: border-box`
  childElm1.style =
    'color: red; rext-align: center; background-color: #00aeec45; width: 200px; height: auto; margin-top: 40px;'
  childElm2.style = 'background-color: green; width: 50px; height: 120px'

  document.body.insertBefore(elm, canvas)
  textElm.appendChild(text)
  childElm1.appendChild(textElm)
  elm.appendChild(childElm1)
  elm.appendChild(childElm2)
}

initCanvas()
initHTMLELement()
