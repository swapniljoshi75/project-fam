import { useMemo, useRef, useEffect } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import FamilyNode from './FamilyNode'
import { buildFlowGraph } from '../utils/flowLayout'

const nodeTypes = { familyNode: FamilyNode }

export default function FamilyFlow({
  persons,
  isAdmin,
  onAddChild,
  onAddParent,
  onAddSpouse,
  onAddRoot,
  onEdit,
  onDelete,
  onEditSpouse,
  onDeleteSpouse,
  activeTapId,
  setActiveTapId,
}) {

  const { nodes: baseNodes, edges } = useMemo(
    () => buildFlowGraph(persons),
    [persons],
  )

  const nodes = useMemo(
    () => baseNodes.map(n => ({
      ...n,
      data: { ...n.data, isAdmin, onAddChild, onAddParent, onAddSpouse, onEdit, onDelete, onEditSpouse, onDeleteSpouse, activeTapId, setActiveTapId },
    })),
    [baseNodes, isAdmin, onAddChild, onAddParent, onAddSpouse, onEdit, onDelete, onEditSpouse, onDeleteSpouse, activeTapId],
  )

  const rfInstance = useRef(null)
  const userInteracted = useRef(false)
  const trackingEnabled = useRef(false)
  const suppressNextMove = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => { trackingEnabled.current = true }, 500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const handleOrientation = () => {
      if (!userInteracted.current && rfInstance.current) {
        suppressNextMove.current = true
        setTimeout(() => {
          rfInstance.current.fitView({ padding: 0.22 })
          setTimeout(() => { suppressNextMove.current = false }, 300)
        }, 150)
      }
    }
    window.addEventListener('orientationchange', handleOrientation)
    return () => window.removeEventListener('orientationchange', handleOrientation)
  }, [])

  if (persons.filter(p => p.isNode).length === 0) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'80px 24px', textAlign:'center' }}>
        <span style={{ fontSize:56 }}>🌳</span>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700 }}>No family members yet</h2>
        <p style={{ margin:0, color:'#64748B', fontSize:14 }}>
          {isAdmin
            ? 'Start building your family tree.'
            : 'The family tree is empty. Check back later.'}
        </p>
        {isAdmin && (
          <button className="btn btn-primary" onClick={onAddRoot}>
            + Add First Member
          </button>
        )}
      </div>
    )
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.22 }}
      minZoom={0.06}
      maxZoom={2}
      nodesDraggable={false}
      nodesConnectable={false}
      panOnScroll
      panOnScrollMode="free"
      zoomOnScroll={false}
      zoomOnPinch
      proOptions={{ hideAttribution: true }}
      defaultEdgeOptions={{
        type: 'smoothstep',
        style: { stroke:'#CBD5E1', strokeWidth:2 },
      }}
      onInit={(instance) => { rfInstance.current = instance }}
      onMoveStart={() => {
        if (trackingEnabled.current && !suppressNextMove.current) {
          userInteracted.current = true
        }
      }}
    >
      <Controls
        showInteractive={false}
        position="top-right"
        onFitView={() => {
          suppressNextMove.current = true
          userInteracted.current = false
          setTimeout(() => { suppressNextMove.current = false }, 300)
        }}
        style={{ boxShadow:'0 4px 16px rgba(0,0,0,0.10)', borderRadius:12, overflow:'hidden', border:'1px solid #E8EDF2' }}
      />
      <Background variant={BackgroundVariant.Dots} gap={28} size={1.2} color="#D8E0EA" />
    </ReactFlow>
  )
}
