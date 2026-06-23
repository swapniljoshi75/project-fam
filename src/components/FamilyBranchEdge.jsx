import { BaseEdge } from '@xyflow/react'

// Classic family-tree bracket connector.
//
// drawRail=true  (first/leftmost child edge):
//   draws the parent vertical stem + the full horizontal rail + this child's drop
//
// drawRail=false (every other child edge):
//   draws only the vertical drop from rail level to the child handle
//
// The rail is anchored at the ACTUAL targetX of the leftmost child (not a
// precomputed coordinate), so it stays aligned regardless of node render width.
// The right end is targetX + railSpanRight where railSpanRight is the difference
// between the rightmost and leftmost sibling center Xs (a relative value, immune
// to any systematic width offset).
export function FamilyBranchEdge({ id, sourceX, sourceY, targetX, targetY, data, style }) {
  const { drawRail, railSpanRight = 0 } = data ?? {}
  const railY = sourceY + (targetY - sourceY) * 0.5

  let d
  if (drawRail) {
    const railLeft  = targetX                  // actual left handle position
    const railRight = targetX + railSpanRight  // actual right handle position

    d = [
      // Parent stem: straight down to rail level
      `M ${sourceX} ${sourceY} L ${sourceX} ${railY}`,
      // Horizontal rail spanning all siblings (passes through the stem at sourceX)
      `M ${railLeft} ${railY} L ${railRight} ${railY}`,
      // Drop from rail to this (leftmost) child
      `M ${targetX} ${railY} L ${targetX} ${targetY}`,
    ].join(' ')
  } else {
    // Only the vertical drop; the rail was already drawn by the drawRail edge
    d = `M ${targetX} ${railY} L ${targetX} ${targetY}`
  }

  return <BaseEdge id={id} path={d} style={style} />
}
