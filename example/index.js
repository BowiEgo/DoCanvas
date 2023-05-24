const { createDoCanvas } = XCanvas

const STR_CN =
  '😱 😱 😱 👌👌👌一、选择适合的报纸在进行登报挂失前，您需要选择一家有一定知名度和影响力的报纸进行登报。目前，大多数地区都有本地的日报、晚报、周报等媒体，您可以选择其中的一家来登报。二、撰写登报文章登报文章的撰写需要遵守一定的规定和格式。一般来说，登报文章应该包含以下几个方面的内容： '
const STR_EN =
  '😱 😱 😱 👌👌👌This webpage transforms plain text into the immaculate emoji language.Want emoji tokens for the VOIP service Discord instead of Unicode characters? Tick that checkbox!'

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
      width: 300,
      height: 'auto',
      marginTop: 40
    }
  })
  const childElm2 = DoCanvas.createElement('view', {
    style: {
      backgroundColor: 'green',
      width: 50,
      height: 40
    }
  })
  const childElm3 = DoCanvas.createElement('view', {
    style: {
      backgroundColor: '#cddc39',
      width: 150,
      height: 50
    }
  })
  const textElm1 = DoCanvas.createElement(
    'text',
    { style: { fontSize: 16 } },
    STR_CN
  )

  const textElm2 = DoCanvas.createElement(
    'text',
    { style: { fontSize: 16 } },
    STR_EN
  )

  childElm1.appendChild(textElm1)
  // childElm1.appendChild(textElm2)
  elm.appendChild(childElm1)
  elm.appendChild(childElm2)
  elm.appendChild(childElm3)
  DoCanvas.body.appendChild(elm)

  console.log(elm.node.instance, elm)
  console.log(childElm1.container === elm)
}

function initHTMLELement() {
  const canvas = document.querySelector('#canvas')
  const elm = document.createElement('div')
  const childElm1 = document.createElement('div')
  const childElm2 = document.createElement('div')
  const childElm3 = document.createElement('div')
  const childElm4 = document.createElement('div')
  const textElm1 = document.createElement('span')
  const textElm2 = document.createElement('span')
  const text1 = document.createTextNode(STR_CN)
  const text2 = document.createTextNode(STR_EN)

  elm.style = `height: ${
    window.innerHeight / 2
  }px; border-bottom: 1px solid #000;box-sizing: border-box`
  childElm1.style =
    'color: red; rext-align: center; background-color: #00aeec45; width: 300px; height: auto; margin-top: 40px;'
  childElm2.style = 'background-color: green; width: 50px; height: 40px'
  childElm3.style =
    'display:inline-block; background-color: #cddc39; width: 150px; height: 50px'
  childElm4.style =
    'display:inline-block; background-color: #ff9800; width: 150px; height: 50px'

  document.body.insertBefore(elm, canvas)
  textElm1.appendChild(text1)
  // textElm2.appendChild(text2)
  childElm1.appendChild(textElm1)
  childElm1.appendChild(textElm2)
  elm.appendChild(childElm1)
  elm.appendChild(childElm2)
  elm.appendChild(childElm3)
  elm.appendChild(childElm4)
}

// let f = new FontFace('PingFang SC', 'url(./)');

initCanvas()
initHTMLELement()
