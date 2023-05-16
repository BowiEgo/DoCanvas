import { RendererOptions } from './renderer'

export function createNodeOps(createElement): RendererOptions {
  return {
    insert: (child, parent, anchor) => {
      if (!child) {
        return
      }

      parent.appendChild(child)
    },

    remove: (child) => {},

    createElement: (tag, props) => {
      props = props || {}
      const { style } = props

      switch (tag) {
        default:
          return createElement('view', { style })
      }
    },

    createText: (text) => {
      // console.log('createText', text)
      return createElement('text', {}, text)
    },

    createComment: (text) => {},

    setText: (node, text) => {},

    setElementText: (el, text) => {},

    parentNode: (node) => node.parentNode as Element | null,

    nextSibling: (node) => node.nextSibling

    //   querySelector: (selector) => {},
  }
}
