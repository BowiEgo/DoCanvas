import { connectChildren, createTreeNode } from '../../tree-node'

describe('tree-node', () => {
  const tree = createTreeNode({
    textContent: 'A',
    children: [
      createTreeNode({
        textContent: 'B',
        children: [
          createTreeNode({ textContent: 'C', children: [] })({}),
          createTreeNode({
            textContent: 'D',
            children: [createTreeNode({ textContent: 'E' })({})]
          })({})
        ]
      })({}),
      createTreeNode({
        textContent: 'F',
        children: [createTreeNode({ textContent: 'G' })({})]
      })({}),
      createTreeNode({
        textContent: 'H'
      })({})
    ]
  })({})

  connectChildren(tree)

  // +-- A
  //     +-- B
  //     |   +-- C
  //     |   +-- D
  //     |       +-- E
  //     +-- F
  //     |   +-- G
  //     +-- H

  test('get previous node', () => {
    expect(tree.children[2].getPreviousNode().options.textContent).toEqual('F')
    expect(tree.children[0].children[0].getPreviousNode()).toEqual(null)
  })

  test('get next node', () => {
    expect(tree.children[1].getNextNode().options.textContent).toEqual('H')
    expect(tree.children[1].children[0].getNextNode()).toEqual(null)
  })

  test('replace child node', () => {
    tree.replaceChildNode(
      tree.children[2],
      createTreeNode({ textContent: 'I' })({})
    )

    expect(tree.children[2].options.textContent).toEqual('I')
  })
})
