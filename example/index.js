const { h, createNodeOps, createRenderer, createLayer } = XCanvas

function init() {
  const canvas = document.querySelector('#canvas')

  const _ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio
  const _w = window.innerWidth
  const _h = window.innerHeight
  canvas.width = _w * dpr
  canvas.height = _h * dpr

  console.log(_ctx, dpr, _w, _h)

  const { layer, createCanvasElement } = createLayer(_ctx, {
    dpr,
    width: _w,
    height: _h,
    lifecycle: {
      onEffectSuccess: () => {
        // 网络请求完成，比如网络图片加载完成并且重新绘制完毕
      },
      onEffectFail() {
        // 网络请求失败
      }
    }
  })

  // const App = h('div', { style: { color: 'red', borderColor: 'red' } }, [
  //   'hello ',
  //   h('span', 'world')
  // ])
  // console.log('App', App)

  // const app = createRenderer(createNodeOps(createCanvasElement)).createApp(App)
  // console.log('app', app)

  // app.mount(layer.node)

  const elm = createCanvasElement('view')
  const childElm = createCanvasElement('view', {
    style: { color: 'red', textAlign: 'center' }
  })
  const textElm = createCanvasElement('text', {
    style: { color: 'green' }
  })

  layer.mount(elm)

  childElm.appendChild(textElm)
  elm.appendChild(childElm)
  // console.log(childElm.renderStyles)
  // console.log(textElm._getExtendStyles())
}

init()

// const App = {
//   template: '<div><span>Hello World!!</span></div>'
// }

// const layer = XCanvas.createLayer(ctx, {
//   dpr,
//   width: w,
//   height: h,
//   lifecycle: {
//     onEffectSuccess: () => {
//       // 网络请求完成，比如网络图片加载完成并且重新绘制完毕
//     },
//     onEffectFail() {
//       // 网络请求失败
//     }
//   }
// })

// console.log(layer)

// const viewNode = XCanvas.createElement((h) => {
//   return h(
//     'view',
//     {
//       styles: {
//         display: 'inline-block',
//         width: 40,
//         verticalAlign: 'middle'
//       }
//     },
//     []
//   )
// })
// const textNode = XCanvas.createElement((h) => {
//   return h('text', {}, '这是一段文字')
// })

// const node = XCanvas.createElement((h) => {
//   return h(
//     'view',
//     {
//       styles: {}
//     },
//     [
//       h(
//         'view',
//         {
//           styles: {
//             height: 20,
//             backgroundColor: '#ff6c79',
//             borderRadius: 10,
//             borderColor: '#fff',
//             margin: 2,
//             display: 'inline-block',
//             paddingLeft: 10,
//             paddingRight: 10,
//             lineHeight: 20,
//             verticalAlign: 'middle',
//             color: '#fff'
//           },
//           on: {
//             click(e) {
//               console.log(e)
//             }
//           }
//         },
//         [h('text', {}, '事事顺遂遂')]
//       ),
//       h(
//         'view',
//         {
//           styles: {
//             display: 'inline-block',
//             width: 40,
//             verticalAlign: 'top'
//           }
//         },
//         [h('text', {}, '事事')]
//       ),
//       h(
//         'view',
//         {
//           styles: {
//             display: 'inline-block',
//             width: 40,
//             verticalAlign: 'bottom'
//           }
//         },
//         [h('text', {}, '事事顺遂事事顺遂')]
//       )
//     ]
//   )
// })
// console.log(node)
// node.mount(layer)
