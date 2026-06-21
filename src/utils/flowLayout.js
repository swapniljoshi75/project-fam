import dagre from '@dagrejs/dagre'

export const NODE_W = 260
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

  // ── Center each parent exactly above the midpoint of its children ─────────
  // Dagre's global optimisation can leave parents offset; this pass fixes it.
  // We work bottom-up (deepest parents first) so that when we re-center a
  // grandparent it uses the already-corrected positions of its children.

  const nodeX = {}
  nodeList.forEach(p => { const pos = g.node(p.id); if (pos) nodeX[p.id] = pos.x })

  const nodeById = Object.fromEntries(nodeList.map(p => [p.id, p]))
  const depth = {}
  const getDepth = (id) => {
    if (depth[id] != null) return depth[id]
    const node = nodeById[id]
    if (!node?.parentId || !idSet.has(node.parentId)) return (depth[id] = 0)
    return (depth[id] = getDepth(node.parentId) + 1)
  }
  nodeList.forEach(p => getDepth(p.id))

  Object.entries(byParent)
    .sort(([a], [b]) => (depth[b] ?? 0) - (depth[a] ?? 0))
    .forEach(([parentId, siblings]) => {
      const xs = siblings.map(p => nodeX[p.id]).filter(x => x != null)
      if (xs.length) nodeX[parentId] = (Math.min(...xs) + Math.max(...xs)) / 2
    })
  // ─────────────────────────────────────────────────────────────────────────

  const childParentIds = new Set(children.map(p => p.parentId))
  const childCountMap = {}
  children.forEach(p => { childCountMap[p.parentId] = (childCountMap[p.parentId] ?? 0) + 1 })

  const nodes = nodeList.map(p => {
    const pos = g.node(p.id)
    if (!pos) return null
    const x = nodeX[p.id] ?? pos.x
    const { y } = pos
    return {
      id: p.id,
      type: 'familyNode',
      position: { x: x - NODE_W / 2, y: y - NODE_H / 2 },
      data: { person: p, hasChildren: childParentIds.has(p.id), childCount: childCountMap[p.id] ?? 0 },
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
