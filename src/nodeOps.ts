import { ElementTypes } from './canvas/element'
import { RendererOptions } from './renderer'

export function createNodeOps(createElement): RendererOptions {
  return {
    insert: (child, parent, anchor) => {
      console.log('insert-------------', child, parent, anchor)
      if (!child) {
        return
      }

      parent.appendChild(child)
    },

    remove: (child) => {
      console.log('remove-------------', child)
    },

    createElement: (tag, props) => {
      console.log('createElement------------', tag, props)

      props = props || {}
      const { style } = props

      switch (tag) {
        default:
          return createElement(ElementTypes.view, { style })
      }
    },

    createText: (text) => {
      // console.log('createText', text)
      return createElement(ElementTypes.text, {}, text)
    },

    createComment: (text) => {},

    setText: (node, text) => {},

    setElementText: (el, text) => {},

    parentNode: (node) => node.parentNode as Element | null,

    nextSibling: (node) => node.nextSibling

    //   querySelector: (selector) => {},
  }
}
