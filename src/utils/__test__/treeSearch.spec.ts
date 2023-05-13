import { connectChildren, createTreeNode } from '../../canvas/tree-node'
import { BFS, PostOrderDFS } from '../treeSearch'

describe('utils/traversal', () => {
  const root = createTreeNode({
    instance: 'root',
    children: [
      createTreeNode({
        instance: 'child1',
        children: [
          createTreeNode({ instance: 'child11', children: [] }),
          createTreeNode({
            instance: 'child12',
            children: [createTreeNode({ instance: 'child121' })]
          })
        ]
      }),
      createTreeNode({
        instance: 'child2',
        children: [createTreeNode({ instance: 'child21' })]
      }),
      createTreeNode({
        instance: 'child3'
      })
    ]
  })

  connectChildren(root)

  test('transpile an nodeTree to a breatchFirst array', () => {
    const breathArr = BFS(root)

    expect(breathArr.map((item) => item.instance)).toEqual([
      'root',
      'child1',
      'child2',
      'child3',
      'child11',
      'child12',
      'child21',
      'child121'
    ])
  })

  test('transpile an nodeTree to an post-order deepFirst array', () => {
    const deepArr = PostOrderDFS(root)

    expect(deepArr.map((item) => item.instance)).toEqual([
      'child11',
      'child121',
      'child12',
      'child1',
      'child21',
      'child2',
      'child3',
      'root'
    ])
  })
})
