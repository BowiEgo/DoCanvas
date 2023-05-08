import { createElement } from './canvas'
import { ElementTypes } from './canvas/element'
import { RendererOptions } from './renderer'

export const createNodeOps = (renderContext: any): RendererOptions => {
  return {
    insert: (child, parent, anchor) => {
      console.log('insert', child, parent, anchor)
      if (!child) {
        return
      }

      parent.appendChild(child)
    },

    remove: (child) => {
      console.log('remove', child)
    },

    createElement: (tag, props) => {
      console.log('createElement', tag, props)

      props = props || {}
      const { style } = props

      switch (tag) {
        default:
          return createElement(
            ElementTypes.view,
            { style },
            null,
            renderContext
          )
      }
    },

    createText: (text) => {
      // console.log('createText', text)
      return createElement(ElementTypes.text, {}, null, renderContext)
    },

    createComment: (text) => {},

    setText: (node, text) => {},

    setElementText: (el, text) => {},

    parentNode: (node) => node.parentNode as Element | null,

    nextSibling: (node) => node.nextSibling

    //   querySelector: (selector) => {},
  }
}
