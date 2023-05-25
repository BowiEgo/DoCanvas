<h1 align="center">
DoCanvas
</h1>
<p align="center">
A tool for rendering canvas like html.
<p>
<p align="center">
  <a href="https://www.npmjs.com/package/do-canvas"><img src="https://img.shields.io/npm/v/do-canvas?color=729B1B&label="></a>
<p>

<p align="center">
 <a href="https://github.com/BowiEgo/XCanvas/blob/main/README.md">Documentation</a> | <a href="https://github.com/BowiEgo/XCanvas/blob/main/README.md">Getting Started</a> | <a href="https://github.com/BowiEgo/XCanvas/tree/main/example">Examples</a>
</p>

<h4 align="center">

</h4>
<br>
<br>

### Features

- render element like HTML

```ts
import { createDoCanvas } from 'do-canvas'

const canvas = document.querySelector('#canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
const dpr = window.devicePixelRatio || 1
const rect = canvas.getBoundingClientRect()
const w = 375
const h = 800

canvas.width = rect.w * dpr
canvas.height = rect.h * dpr
ctx.scale(dpr, dpr)

const DoCanvas = createDoCanvas({
  canvas,
  ctx,
  dpr,
  width: w,
  height: h,
  backgroundColor: '#fff',
  debug: false
})
```

create element with properties:

```ts
const elm = DoCanvas.createElement('view', { id: 'container' })
const childElm = DoCanvas.createElement('view', {
  id: 'childElm:text-container',
  style: {
    color: 'red',
    textAlign: 'center',
    backgroundColor: '#00aeec45',
    width: 300,
    height: 'auto',
    marginTop: 40
  }
})

elm.appendChild(childElm)
```

create text element:

```ts
const textElm = DoCanvas.createElement(
  'text',
  { style: { fontSize: 15 } },
  'Hello World! 👌👌👌'
)

childEm.appendChild(textElm)
```

append to body like HTML to render elements:

```ts
DoCanvas.body.appendChild(elm)
```

### TODO

- element text:block(\<p>) text(\<span>) text:strong(\<strong>) text:hyperlink(\<a>)
- element image
- element scrollview
- render HTML space characters like \&nbsp;
- auto resize canvas when element over viewport
- event capturing and bubbling
