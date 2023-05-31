import { connectChildren, createTreeNode } from '../../tree-node'
import { BFS, PostOrderDFS } from '../treeSearch'

describe('utils/traversal test', () => {
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

  test('transpile an nodeTree to a breathFirst array', () => {
    const breathArr = BFS(tree)

    expect(breathArr.map((item) => item.textContent)).toEqual([
      'A',
      'B',
      'F',
      'H',
      'C',
      'D',
      'G',
      'E'
    ])
  })

  test('transpile an nodeTree to an post-order deepFirst array', () => {
    const deepArr = PostOrderDFS(tree)

    expect(deepArr.map((item) => item.textContent)).toEqual([
      'C',
      'E',
      'D',
      'B',
      'G',
      'F',
      'H',
      'A'
    ])
  })
})
