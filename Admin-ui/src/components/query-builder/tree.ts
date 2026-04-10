import type { QueryGroupNode, QueryNode, QueryRuleNode } from './types'
import { isGroup } from './types'

export function mutateNodeById(
  root: QueryGroupNode,
  targetId: string,
  fn: (n: QueryNode) => QueryNode,
): QueryGroupNode {
  const walk = (node: QueryNode): QueryNode => {
    if (node.id === targetId) return fn(node)
    if (isGroup(node)) {
      return { ...node, children: node.children.map(walk) }
    }
    return node
  }
  return walk(root) as QueryGroupNode
}

export function removeNodeById(root: QueryGroupNode, targetId: string): QueryGroupNode {
  const filter = (g: QueryGroupNode): QueryGroupNode => ({
    ...g,
    children: g.children
      .filter((c) => c.id !== targetId)
      .map((c) => (isGroup(c) ? filter(c) : c)),
  })
  return filter(root)
}

export function appendChildToGroup(
  root: QueryGroupNode,
  groupId: string,
  child: QueryNode,
): QueryGroupNode {
  return mutateNodeById(root, groupId, (n) => {
    if (!isGroup(n)) return n
    return { ...n, children: [...n.children, child] }
  })
}
