import { memo, useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'

const GENDER = {
  male:   { header: '#3B82F6', soft: '#EFF6FF', text: '#1D4ED8' },
  female: { header: '#EC4899', soft: '#FDF2F8', text: '#BE185D' },
}

const handleStyle = { background: '#CBD5E1', border: '1px solid #CBD5E1', width: 7, height: 7 }

const adminBtn = {
  width: 20, height: 20, flexShrink: 0,
  color: 'rgba(255,255,255,0.7)',
  '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.15)' },
}

const plusBtn = {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 22, height: 22,
  background: '#fff',
  border: '1.5px solid #CBD5E1',
  borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  fontSize: 16, lineHeight: 1, color: '#64748B',
  boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
  zIndex: 10,
  transition: 'border-color 0.15s, color 0.15s',
}

function FamilyNode({ data }) {
  const { person, isAdmin, onAddChild, onAddParent, onAddSpouse, onEdit, onDelete, onEditSpouse, onDeleteSpouse, activeTapId, setActiveTapId, hasChildren } = data
  const isRoot = !person.parentId
  const pc = GENDER[person.gender] ?? GENDER.male
  const sc = GENDER[person.spouseGender] ?? GENDER.female

  const [hovered, setHovered] = useState(false)
  const show = hovered || activeTapId === person.id

  const handleTap = (e) => {
    if (e.pointerType === 'touch') {
      setActiveTapId(prev => prev === person.id ? null : person.id)
    }
  }

  return (
    <Box
      sx={{ minWidth: 220, position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerUp={handleTap}
    >
      <Handle type="target" position={Position.Top} style={handleStyle} />

      {/* Top + button: root nodes, admin only → add parent */}
      {isRoot && isAdmin && (
        <Box
          component="button"
          onClick={() => onAddParent(person)}
          sx={{ ...plusBtn, top: -11, opacity: show ? 1 : 0, pointerEvents: show ? 'auto' : 'none', transition: 'opacity 0.15s' }}
          title="Add Parent"
        >
          +
        </Box>
      )}

      <Card
        elevation={0}
        sx={{
          border: '1.5px solid #E2E8F0',
          borderRadius: 2.5,
          overflow: 'hidden',
          transition: 'box-shadow 0.18s',
          '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.12)' },
        }}
      >
        {/* ── Person header ── */}
        <Box sx={{ background: pc.header, px: 1.75, py: 1.1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.3, whiteSpace: 'nowrap', flex: 1 }}>
            {person.name}
          </Typography>
          {isAdmin && (
            <>
              <IconButton size="small" onClick={() => onEdit(person)} sx={adminBtn}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </IconButton>
              {!hasChildren && (
                <IconButton size="small" onClick={() => onDelete(person.id)} sx={{ ...adminBtn, '&:hover': { color: '#FCA5A5', background: 'rgba(255,255,255,0.15)' } }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </IconButton>
              )}
            </>
          )}
        </Box>

        {/* ── Spouse row ── */}
        {person.spouseName ? (
          <Box sx={{ background: sc.soft, borderTop: `1.5px solid ${sc.soft}`, px: 1.75, py: 0.8, minHeight: 36, display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography sx={{ color: sc.text, fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', flex: 1 }}>
              {person.spouseName}
            </Typography>
            {isAdmin && (
              <>
                <IconButton size="small" onClick={() => onEditSpouse(person)} sx={{ width: 20, height: 20, color: sc.text, opacity: 0.5, '&:hover': { opacity: 1, background: 'rgba(0,0,0,0.06)' } }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </IconButton>
                <IconButton size="small" onClick={() => onDeleteSpouse(person.id)} sx={{ width: 20, height: 20, color: '#EF4444', opacity: 0.5, '&:hover': { opacity: 1, background: 'rgba(239,68,68,0.08)' } }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </IconButton>
              </>
            )}
          </Box>
        ) : (
          <Box sx={{ background: '#FAFAFA', borderTop: '1.5px solid #F1F5F9', px: 1.75, py: 0.8, minHeight: 36, display: 'flex', alignItems: 'center' }}>
            <Typography
              component="button"
              onClick={() => onAddSpouse(person)}
              sx={{ fontSize: 11, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', p: 0, textDecoration: 'underline dotted', '&:hover': { color: '#475569' }, lineHeight: 1 }}
            >
              + Add {person.gender === 'male' ? 'Wife' : 'Husband'}
            </Typography>
          </Box>
        )}
      </Card>

      <Handle type="source" position={Position.Bottom} style={handleStyle} />

      {/* Bottom + button: all nodes → add child */}
      <Box
        component="button"
        onClick={() => onAddChild(person)}
        sx={{ ...plusBtn, bottom: -11, opacity: show ? 1 : 0, pointerEvents: show ? 'auto' : 'none', transition: 'opacity 0.15s' }}
        title="Add Child"
      >
        +
      </Box>
    </Box>
  )
}

export default memo(FamilyNode)
