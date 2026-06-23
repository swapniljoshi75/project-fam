export const NODE_W = 260
export const NODE_H = 116
const H_GAP = 56   // horizontal gap between sibling subtrees
const V_GAP = 90   // vertical gap between generations

export function buildFlowGraph(persons) {
  const nodeList = persons.filter(p => p.isNode)
  if (nodeList.length === 0) return { nodes: [], edges: [] }

  const idSet = new Set(nodeList.map(p => p.id))

  // Build children map, sort elder-first (highest siblingOrder → leftmost)
  const childrenMap = {}
  nodeList.forEach(p => {
    if (p.parentId && idSet.has(p.parentId)) {
      (childrenMap[p.parentId] ??= []).push(p)
    }
  })
  // Ascending: lower siblingOrder (1=first-born=elder) goes left, higher goes right
  Object.values(childrenMap).forEach(sibs =>
    sibs.sort((a, b) => (a.siblingOrder ?? a.addedAt ?? 0) - (b.siblingOrder ?? b.addedAt ?? 0))
  )

  // Nodes whose parent is absent from the set are forest roots
  const roots = nodeList.filter(p => !p.parentId || !idSet.has(p.parentId))

  // Reingold-Tilford: compute minimum subtree width bottom-up
  const subtreeW = {}
  function getW(id) {
    if (subtreeW[id] != null) return subtreeW[id]
    const ch = childrenMap[id] ?? []
    if (!ch.length) return (subtreeW[id] = NODE_W)
    const childTotal = ch.reduce((s, c) => s + getW(c.id), 0)
    return (subtreeW[id] = Math.max(NODE_W, childTotal + (ch.length - 1) * H_GAP))
  }
  roots.forEach(r => getW(r.id))

  // Top-down position assignment — each subtree occupies its own non-overlapping band
  const nodeCX = {}, nodeCY = {}
  function place(id, left, depth) {
    nodeCX[id] = left + getW(id) / 2
    nodeCY[id] = depth * (NODE_H + V_GAP) + NODE_H / 2
    const ch = childrenMap[id] ?? []
    let cursor = left
    ch.forEach(c => {
      place(c.id, cursor, depth + 1)
      cursor += getW(c.id) + H_GAP
    })
  }
  let xOffset = 0
  roots.forEach(r => {
    place(r.id, xOffset, 0)
    xOffset += getW(r.id) + H_GAP * 2
  })

  const hasChildSet = new Set(Object.keys(childrenMap))
  const childCountMap = {}
  Object.entries(childrenMap).forEach(([pid, ch]) => { childCountMap[pid] = ch.length })

  const nodes = nodeList
    .filter(p => nodeCX[p.id] != null)
    .map(p => ({
      id: p.id,
      type: 'familyNode',
      position: { x: nodeCX[p.id] - NODE_W / 2, y: nodeCY[p.id] - NODE_H / 2 },
      data: { person: p, hasChildren: hasChildSet.has(p.id), childCount: childCountMap[p.id] ?? 0 },
      draggable: false,
    }))

  // Build edges: single child → straight line; multiple → shared bracket rail
  const edges = []
  Object.entries(childrenMap).forEach(([parentId, siblings]) => {
    const multi = siblings.length > 1
    siblings.forEach((child, i) => {
      edges.push({
        id: `e-${parentId}-${child.id}`,
        source: parentId,
        target: child.id,
        type: multi ? 'familyBranch' : 'straight',
        style: { stroke: '#CBD5E1', strokeWidth: 2 },
        ...(multi && {
          data: {
            drawRail: i === 0,
            // Horizontal span between leftmost and rightmost child centers.
            // Using a relative offset (not absolute X) so it stays correct even
            // if the node's actual rendered width differs from NODE_W.
            railSpanRight: nodeCX[siblings[siblings.length - 1].id] - nodeCX[siblings[0].id],
          },
        }),
      })
    })
  })

  return { nodes, edges }
}
