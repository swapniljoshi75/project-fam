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
  nodeList
    .filter(p => p.parentId && idSet.has(p.parentId))
    .forEach(p => g.setEdge(p.parentId, p.id))

  dagre.layout(g)

  const childParentIds = new Set(nodeList.filter(p => p.parentId).map(p => p.parentId))

  const nodes = nodeList.map(p => {
    const { x, y } = g.node(p.id)
    const spouse = p.spouseId
      ? (persons.find(s => s.id === p.spouseId) ?? null)
      : (persons.find(s => !s.isNode && s.spouseId === p.id) ?? null)
    return {
      id: p.id,
      type: 'familyNode',
      position: { x: x - NODE_W / 2, y: y - NODE_H / 2 },
      data: { person: p, spouse, hasChildren: childParentIds.has(p.id) },
      draggable: false,
    }
  })

  const edges = nodeList
    .filter(p => p.parentId && idSet.has(p.parentId))
    .map(p => ({
      id: `e-${p.parentId}-${p.id}`,
      source: p.parentId,
      target: p.id,
      type: 'smoothstep',
      style: { stroke: '#CBD5E1', strokeWidth: 2 },
    }))

  return { nodes, edges }
}
