const { createDoCanvas } = XCanvas

const STR_CN =
  '大家晚上好呀！盒宝我又来开奖啦🥳恭喜幸运瓜农@不过俗人尔 获得【12个月 PGP 兑换码*1】！请于6月10日前来私信盒宝领取奖品哦！感谢大家的参与，下个幸运儿一定是你！👏🏻'
const STR_EN =
  '😱👌This webpage transforms plain text into the immaculate emoji language.Want emoji tokens for the VOIP service Discord instead of Unicode characters? Tick that checkbox!'

function initCanvas(fontFamily) {
  const canvas = document.querySelector('#canvas')
  canvas.style.display = 'block'

  const _ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio
  const rect = canvas.getBoundingClientRect()
  const _w = rect.width
  const _h = rect.height
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
    fontFamily,
    debug: false
  })

  // const elm = DoCanvas.createElement('view', { id: 'container' })
  // const childElm1 = DoCanvas.createElement('view', {
  //   id: 'childElm1:text-container',
  //   style: {
  //     color: 'red',
  //     textAlign: 'center',
  //     backgroundColor: '#00aeec45',
  //     width: 300,
  //     height: 'auto',
  //     marginTop: 20
  //   }
  // })
  // const childElm2 = DoCanvas.createElement('view', {
  //   id: 'childElm2:green',
  //   style: {
  //     backgroundColor: 'green',
  //     width: 50,
  //     height: 40
  //   }
  // })
  // const childElm3 = DoCanvas.createElement('view', {
  //   id: 'childElm3:lightgreen',
  //   style: {
  //     display: 'inline-block',
  //     backgroundColor: 'lightgreen',
  //     width: 150,
  //     height: 30
  //   }
  // })
  // const childElm4 = DoCanvas.createElement('view', {
  //   id: 'childElm4:darkorange',
  //   style: {
  //     display: 'inline-block',
  //     backgroundColor: 'darkorange',
  //     width: 150,
  //     height: 30
  //   }
  // })
  // const childElm5 = DoCanvas.createElement('view', {
  //   id: 'childElm5:pink',
  //   style: {
  //     display: 'inline-block',
  //     backgroundColor: 'pink',
  //     width: 150,
  //     height: 30
  //   }
  // })
  // const textElm1 = DoCanvas.createElement(
  //   'text',
  //   { style: { fontSize: 16, lineHeight: 23 } },
  //   STR_CN
  // )

  // const inlineElm = DoCanvas.createElement('view', {
  //   style: {
  //     display: 'inline-block',
  //     backgroundColor: 'pink',
  //     width: 50,
  //     height: 30
  //   }
  // })

  // const textElm2 = DoCanvas.createElement(
  //   'text',
  //   { style: { fontSize: 16, lineHeight: 23 } },
  //   STR_EN
  // )

  const paraElm1 = DoCanvas.createElement('p', {})
  const spanElm1 = DoCanvas.createElement('span', {
    style: { color: 'rgb(0, 112, 192)' }
  })
  const strongElm1 = DoCanvas.createElement(
    'strong',
    {},
    '4月18日，韦尔股份发布了2023年第一季度业绩。'
  )
  const textNode1 = DoCanvas.createTextNode(
    '2023年一季度，公司实现营收43.35亿元，同比下降21.72%，环比下滑7.67%；净利润1.99亿元，同比下降77.81%。'
  )

  spanElm1.appendChild(strongElm1)
  paraElm1.appendChild(spanElm1)
  paraElm1.appendChild(textNode1)

  console.log('1111111', textNode1.getPreviousNode())
  console.log('1111111', spanElm1.getNextNode())

  // childElm1.appendChild(textElm1)
  // childElm1.appendChild(inlineElm)
  // childElm1.appendChild(textElm2)
  // elm.appendChild(childElm1)
  // elm.appendChild(childElm2)
  // elm.appendChild(childElm3)
  // elm.appendChild(childElm4)
  // elm.appendChild(childElm5)
  DoCanvas.body.appendChild(paraElm1)
  // DoCanvas.body.appendChild(elm)

  // console.log(
  //   '0000',
  //   elm.constructor.name,
  //   elm,
  //   elm.container,
  //   elm.parentNode,
  //   elm.getContainer()
  // )

  // console.log(elm.node.instance, elm)
  // console.log(
  //   '1111',
  //   textElm1.children[0].parentNode === textElm1,
  //   textElm1.children[0].getContainer() === textElm1
  // )
  // console.log('2222', textElm1.getRootNode() === DoCanvas.body)
  // childElm1.getComputedStyles().marginTop = 100
  // childElm1.setComputedStyles('marginTop', 100)
  // console.log(
  //   '3333',
  //   childElm1,
  //   childElm1.getLayoutObject(),
  //   childElm1.getLayoutObject().element === childElm1,
  //   childElm1.renderObject
  // )

  // console.log(
  //   '4444',
  //   childElm1.getLayoutObject().getBoxModel(),
  //   childElm1.getLayoutObject().getBoxModel().marginTop,
  //   childElm1.getLayoutObject().element.getComputedStyles().marginTop,
  //   childElm1.getComputedStyles().marginTop,
  //   DoCanvas.body.getComputedStyles()
  // )
}

function initHTMLELement() {
  const canvas = document.querySelector('#canvas')
  const elm = document.createElement('div')
  const childElm1 = document.createElement('div')
  const childElm2 = document.createElement('div')
  const childElm3 = document.createElement('div')
  const childElm4 = document.createElement('div')
  const childElm5 = document.createElement('div')
  const textElm1 = document.createElement('span')
  const textElm2 = document.createElement('span')
  const text1 = document.createTextNode(STR_CN)
  const text2 = document.createTextNode(STR_EN)
  const inlineElm = document.createElement('div')

  const childElm6 = document.createElement('span')
  const childElm66 = document.createElement('span')
  childElm6.innerText = 'The default value for elements.'
  const childElm7 = document.createElement('div')
  const childElm8 = document.createElement('div')

  textElm1.style = 'font-size: 16px; line-height: 23px'
  inlineElm.style =
    'display: inline-block; background-color: pink;width: 50px;height: 30px'

  elm.style = `height: ${
    window.innerHeight / 2
  }px; border-bottom: 1px solid #000;box-sizing: border-box`
  childElm1.style =
    'color: red; rext-align: center; background-color: #00aeec45; width: 300px; height: auto; margin-top: 20px;'
  childElm2.style = 'background-color: green; width: 50px; height: 40px'
  childElm3.style =
    'display:inline-block; background-color: lightgreen; width: 150px; height: 30px;'
  childElm4.style =
    'display:inline-block; background-color: darkorange; width: 150px; height: 30px'
  childElm5.style =
    'display:inline-block; background-color: pink; width: 150px; height: 30px'

  childElm6.style = 'background-color: lightgreen; width: 50px; height: 30px'
  childElm7.style =
    'display:block; background-color: darkorange; width: 50px; height: 30px'
  childElm8.style =
    'display:block; background-color: pink; width: 50px; height: 30px'

  document.body.insertBefore(elm, canvas)
  textElm1.appendChild(text1)
  textElm2.appendChild(text2)
  childElm1.appendChild(textElm1)
  childElm1.appendChild(inlineElm)
  childElm1.appendChild(textElm2)
  elm.appendChild(childElm1)
  elm.appendChild(childElm2)
  elm.appendChild(childElm3)
  elm.appendChild(childElm4)
  elm.appendChild(childElm5)
  // childElm3.innerText = 'hello'
  // childElm3.appendChild(childElm4)
  // childElm3.appendChild(childElm6)
  // childElm3.appendChild(childElm66)
  // childElm4.appendChild(childElm7)
  // childElm5.appendChild(childElm8)
}

// let f = new FontFace('PingFang SC', 'url(./)');
var defaultFont = window.getComputedStyle(document.documentElement).fontFamily

initCanvas(defaultFont)
initHTMLELement()
