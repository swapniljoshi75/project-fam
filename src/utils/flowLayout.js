import dagre from '@dagrejs/dagre'

export const NODE_W = 220
export const NODE_H = 116

export function buildFlowGraph(persons) {
  const nodeList = persons.filter(p => p.isNode)
  const idSet = new Set(nodeList.map(p => p.id))

  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', ranksep: 90, nodesep: 40, marginx: 40, marginy: 40 })

  nodeList.forEach(p => g.setNode(p.id, { width: NODE_W, height: NODE_H }))

  // Sort siblings by birth order before adding dagre edges so the layout
  // places them left-to-right in elder→younger order.
  const children = nodeList.filter(p => p.parentId && idSet.has(p.parentId))
  const byParent = {}
  children.forEach(p => { (byParent[p.parentId] ??= []).push(p) })
  Object.values(byParent).forEach(siblings => {
    siblings
      .sort((a, b) => (b.siblingOrder ?? b.addedAt ?? 0) - (a.siblingOrder ?? a.addedAt ?? 0))
      .forEach(p => g.setEdge(p.parentId, p.id))
  })

  dagre.layout(g)

  const childParentIds = new Set(children.map(p => p.parentId))

  const nodes = nodeList.map(p => {
    const pos = g.node(p.id)
    if (!pos) return null
    const { x, y } = pos
    return {
      id: p.id,
      type: 'familyNode',
      position: { x: x - NODE_W / 2, y: y - NODE_H / 2 },
      data: { person: p, hasChildren: childParentIds.has(p.id) },
      draggable: false,
    }
  }).filter(Boolean)

  const edges = children.map(p => ({
      id: `e-${p.parentId}-${p.id}`,
      source: p.parentId,
      target: p.id,
      type: 'smoothstep',
      style: { stroke: '#CBD5E1', strokeWidth: 2 },
    }))

  return { nodes, edges }
}
