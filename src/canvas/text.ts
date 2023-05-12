import { isAuto, isExact } from '../utils'
import { CanvasElement } from './element'
import { CanvasRenderer } from './renderer'
import STYLE_CONSTANT, { ElementStyleType } from './styleConstant'

type TextOptions = {}

type Layout = {}

type TextLine = {
  text: string
  layout: Layout
}

export interface TextElement extends CanvasElement {
  layout: any
  lines: TextLine[]
  children: string
  debugColor: string

  _getDefaultStyles(): ElementStyleType
  _measureLayout(): Layout
  _getFont(): string
  _calcLine(): void
  paint(): void
}

export function createTextElement(element: CanvasElement): TextElement {
  let text: TextElement = {
    ...element,
    layout: null,
    lines: [] as TextLine[],
    debugColor: 'blue',

    _getDefaultStyles() {
      return {
        ...STYLE_CONSTANT.DEFAULT_STYLES,
        display: STYLE_CONSTANT.DISPLAY.INLINE_BLOCK,
        width: STYLE_CONSTANT.WIDTH.AUTO,
        textAlign: 'left'
      }
    },

    _measureLayout() {
      console.log('_measureLayout', text)
      text.layout = text.getRenderer().measureText(text, text.children)
      text.layout.height = text.renderStyles.lineHeight
      text._calcLine()
      return text.layout
    },

    _getFont() {
      const { fontSize, fontWeight, fontFamily } = text.renderStyles
      return `${fontWeight} ${fontSize}px ${fontFamily}`
    },

    _calcLine() {
      console.log('_calcLine', text.parent)
      if (!text.parent || !text.children) return

      const { width: textWidth, height: textHeight } = text.layout
      let { contentWidth: parentContentWidth } = text.parent.renderStyles
      const { width: parentWidth } = text.parent.styles
      if (!isAuto(text.styles.width))
        parentContentWidth = text.renderStyles.width
      // 如果一行宽度够，或者父级宽度是auto
      if (
        (isExact(parentContentWidth) && parentContentWidth >= textWidth) ||
        parentWidth === STYLE_CONSTANT.WIDTH.AUTO
      ) {
        text.lines = [
          {
            text: text.children,
            layout: text.layout
          }
        ]
      } else {
        text.lines = []
        let lineIndex = 1
        let lineText = ''
        let layout = null
        let lastLayout = null
        for (let i = 0; i < text.children.length; i++) {
          layout = text
            .getRenderer()
            .measureText(text, lineText + text.children[i])
          if (layout && layout.width > parentContentWidth) {
            if (lineIndex >= text.renderStyles.maxLine) {
              // 最大行数限制 以及maxline省略号实现
              lineText = lineText.substring(0, lineText.length - 2) + '...'
              break
            }
            // 超出了
            text.lines.push({
              text: lineText,
              layout: lastLayout || layout
            })
            lineText = ''
            lineIndex += 1
          }

          lineText += text.children[i]

          lastLayout = layout
        }
        text.layout.width = parentContentWidth
        text.lines.push({
          text: lineText,
          layout: text.getRenderer().measureText(text, lineText)
        })
        // 根据lineheihgt更新height
        text.layout.height = text.lines.length * text.renderStyles.lineHeight
      }
    },

    paint() {
      const renderer = this.getRenderer()
      renderer._drawBackground(text)
      renderer._drawText(text)
      renderer._drawBox(text)
    }
  }

  return text
}
