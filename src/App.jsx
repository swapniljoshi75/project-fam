import { useState, useCallback, useEffect, useRef } from 'react'
import { load, savePersons, uid, signIn, signOut, onAuthChange, deletePersonDoc, EMPTY, loadTreeName, saveTreeName } from './utils/store'
import FamilyFlow from './components/FamilyFlow'
import AddMemberModal from './components/AddMemberModal'
import EditMemberModal from './components/EditMemberModal'

/* ─── Login modal ─── */
function LoginModal({ onClose }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await signIn()
      onClose()
    } catch (e) {
      setError(e.message === 'not-admin' ? 'This Google account is not the admin.' : 'Sign-in failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h2>Admin Login</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 10 }}>
            Sign in with the admin Google account to manage the family tree.
          </p>
          {error && <p style={{ color: '#EF4444', fontSize: 13, margin: '0 0 12px' }}>{error}</p>}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 24px',
                background: '#fff',
                color: '#3c4043',
                border: '1px solid #dadce0',
                borderRadius: 4,
                fontSize: 14,
                fontWeight: 500,
                fontFamily: 'Roboto, Arial, sans-serif',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,.08)',
                opacity: loading ? 0.7 : 1,
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,.15)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,.08)' }}
            >
              <GoogleIcon />
              {loading ? 'Signing in…' : 'Sign in with Google'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

const GENDER_COLOR = {
  male:   { header: '#3B82F6', soft: '#EFF6FF', text: '#1D4ED8' },
  female: { header: '#EC4899', soft: '#FDF2F8', text: '#BE185D' },
}

/* ─── Review panel (admin only) ─── */
function ReviewPanel({ persons, onApprove, onClose }) {
  const sorted = [...persons].sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0))
  const userAdded = sorted.filter(p => !p.addedByAdmin)

  const fmt = (ts) => ts ? new Date(ts).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'
  const getParent = (id) => persons.find(p => p.id === id)?.name ?? '—'

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 1000 }}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: 460,
        background: '#fff', zIndex: 1001, display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        animation: 'slideIn 0.22s ease',
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Member Review <span style={{ color: '#64748B', fontWeight: 400 }}>({userAdded.length})</span></h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#64748B', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px' }}>
          {userAdded.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', marginTop: 40 }}>No members added by users yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {userAdded.map(p => {
                const c = GENDER_COLOR[p.gender] ?? GENDER_COLOR.male
                const relation = p.parentId
                  ? `Child of ${getParent(p.parentId)}`
                  : 'Root'
                return (
                  <div key={p.id} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', background: '#fff' }}>
                    <div style={{ height: 5, background: c.header }} />
                    <div style={{ padding: '18px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>{p.name}</span>
                        <span style={{ fontSize: 11, color: '#94A3B8' }}>{fmt(p.addedAt)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, background: c.soft, color: c.text, padding: '2px 10px', borderRadius: 20 }}>
                            {p.gender === 'male' ? 'Male' : 'Female'}
                          </span>
                          <span style={{ fontSize: 12, color: '#64748B' }}>{relation}</span>
                        </div>
                        <button
                          onClick={() => onApprove([p.id])}
                          style={{ flexShrink: 0, fontSize: 12, padding: '5px 14px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, letterSpacing: 0.2 }}
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* ─── App ─── */
export default function App() {
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [addModal, setAddModal] = useState(null)
  const [editModal, setEditModal] = useState(null)
  const [showReview, setShowReview] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTapId, setActiveTapId] = useState(null)
  const [treeName, setTreeName] = useState('Family Tree')
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const nameInputRef = useRef(null)

  useEffect(() => {
    const unsubscribe = onAuthChange(user => setIsAdmin(!!user))
    return unsubscribe
  }, [])

  useEffect(() => {
    Promise.all([load(), loadTreeName()])
      .then(([d, name]) => { setData(d); setTreeName(name); setLoading(false) })
      .catch(() => { setData(EMPTY); setLoading(false) })
  }, [])

  /* ─── Add member ─── */
  const handleAddMember = useCallback(({ name, gender, parentId, spouseOfId, isParentOf, siblingOrder }) => {
    // Spouse is inline on the main person — no separate document
    if (spouseOfId) {
      const persons = data.persons.map(p =>
        p.id === spouseOfId ? { ...p, spouseName: name.trim(), spouseGender: gender } : p
      )
      const updated = persons.find(p => p.id === spouseOfId)
      setData({ ...data, persons })
      savePersons([updated]).catch(() => alert('Could not save spouse.'))
      setAddModal(null)
      setActiveTapId(null)
      return
    }

    const person = {
      id: uid(),
      name: name.trim(),
      gender,
      isNode: true,
      parentId: parentId ?? null,
      status: 'approved',
      addedAt: Date.now(),
      addedByAdmin: isAdmin,
      siblingOrder: siblingOrder ?? 1,
      spouseName: null,
      spouseGender: null,
    }

    let persons = [...data.persons, person]
    const toSave = [person]

    if (isParentOf) {
      persons = persons.map(p =>
        p.id === isParentOf
          ? { ...p, parentId: person.id, ...(p.siblingOrder == null ? { siblingOrder: 1 } : {}) }
          : p
      )
      const updated = persons.find(p => p.id === isParentOf)
      if (updated) toSave.push(updated)
    }

    setData({ ...data, persons })
    savePersons(toSave).catch(() => {
      alert('Could not save to the database. Your changes will be lost on refresh.')
    })
    setAddModal(null)
    setActiveTapId(null)
  }, [data, isAdmin])

  /* ─── Edit member ─── */
  const handleEditMember = useCallback((updated) => {
    const persons = data.persons.map(p => p.id === updated.id ? updated : p)
    setData({ ...data, persons })
    savePersons([updated])
    setEditModal(null)
  }, [data])

  /* ─── Delete spouse (inline fields) ─── */
  const handleDeleteSpouse = useCallback(async (personId) => {
    const target = data.persons.find(p => p.id === personId)
    if (!target?.spouseName) return
    if (!window.confirm(`Remove "${target.spouseName}" as spouse? This cannot be undone.`)) return
    const updated = { ...target, spouseName: null, spouseGender: null }
    const persons = data.persons.map(p => p.id === personId ? updated : p)
    setData({ ...data, persons })
    savePersons([updated]).catch(() => alert('Could not remove spouse.'))
  }, [data])

  /* ─── Delete member ─── */
  const handleDeleteMember = useCallback(async (personId) => {
    const target = data.persons.find(p => p.id === personId)
    if (!target) return
    if (!window.confirm(`Delete "${target.name}"? This cannot be undone.`)) return

    await deletePersonDoc(personId)

    const toUpdate = []
    const persons = data.persons
      .filter(p => p.id !== personId)
      .map(p => {
        if (p.parentId !== personId) return p
        const next = { ...p, parentId: null }
        toUpdate.push(next)
        return next
      })
    setData({ ...data, persons })
    if (toUpdate.length) savePersons(toUpdate)
  }, [data])

  /* ─── Approve members ─── */
  const handleApprove = useCallback((ids) => {
    const idSet = new Set(ids)
    const persons = data.persons.map(p => idSet.has(p.id) ? { ...p, addedByAdmin: true } : p)
    const toSave = persons.filter(p => idSet.has(p.id))
    setData({ ...data, persons })
    savePersons(toSave).catch(() => alert('Could not save approval. Please try again.'))
    if (persons.filter(p => !p.addedByAdmin).length === 0) setShowReview(false)
  }, [data])

  const startEditName = useCallback(() => {
    setNameInput(treeName)
    setEditingName(true)
  }, [treeName])

  const commitTreeName = useCallback(() => {
    const trimmed = nameInput.trim()
    if (trimmed && trimmed !== treeName) {
      setTreeName(trimmed)
      saveTreeName(trimmed).catch(() => alert('Could not save tree name.'))
    }
    setEditingName(false)
  }, [nameInput, treeName])

  const onAddChild  = useCallback((person) => {
    const usedOrders = data.persons
      .filter(p => p.isNode && p.parentId === person.id && p.siblingOrder != null)
      .map(p => p.siblingOrder)
    setAddModal({ mode: 'child', refNode: person, usedOrders })
  }, [data])
  const onAddParent = useCallback((person) => setAddModal({ mode: 'parent', refNode: person }), [])
  const onAddSpouse   = useCallback((person) => setAddModal({ mode: 'spouse', refNode: person }), [])
  const onEditSpouse  = useCallback((person) => setAddModal({ mode: 'spouse', refNode: person, initialName: person.spouseName ?? '', initialGender: person.spouseGender ?? null }), [])
  const onAddRoot    = useCallback(() => setAddModal({ mode: 'root' }), [])

  const onEdit = useCallback((person) => {
    const usedOrders = person.isNode && person.parentId
      ? data.persons
          .filter(p => p.isNode && p.parentId === person.parentId && p.id !== person.id && p.siblingOrder != null)
          .map(p => p.siblingOrder)
      : []
    setEditModal({ person, usedOrders })
  }, [data])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:16, color:'#64748B' }}>
      <div style={{ width:36, height:36, border:'3px solid #E2E8F0', borderTopColor:'#3B82F6', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <p style={{ fontSize:14, margin:0 }}>Loading family tree…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  const userAddedCount = data.persons.filter(p => !p.addedByAdmin).length

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="logo">🌳</span>
          {editingName ? (
            <input
              ref={nameInputRef}
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') commitTreeName()
                if (e.key === 'Escape') setEditingName(false)
              }}
              onBlur={commitTreeName}
              style={{ fontSize: 18, fontWeight: 700, border: 'none', borderBottom: '2px solid #3B82F6', outline: 'none', background: 'transparent', color: 'inherit', width: Math.max(nameInput.length, 8) + 'ch' }}
              autoFocus
            />
          ) : (
            <h1
              title={isAdmin ? 'Click to rename' : undefined}
              onClick={isAdmin ? startEditName : undefined}
              style={{ cursor: isAdmin ? 'text' : 'default' }}
            >
              {treeName}
              {isAdmin && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#94A3B8" style={{ marginLeft: 8, verticalAlign: 'middle', flexShrink: 0 }}>
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              )}
            </h1>
          )}
        </div>
        <div className="header-right">
          {isAdmin && userAddedCount > 0 && (
            <button className="btn btn-ghost" onClick={() => setShowReview(true)}>
              Review <span className="badge">{userAddedCount}</span>
            </button>
          )}
          {isAdmin ? (
            <button className="btn btn-ghost" onClick={signOut} style={{ fontSize:12 }}>
              🔓 Admin · Sign out
            </button>
          ) : (
            <button className="btn btn-ghost hide-mobile" onClick={() => setShowLogin(true)} style={{ fontSize:12 }}>
              Admin Login
            </button>
          )}
        </div>
      </header>

      <div style={{ height: 'calc(100vh - 56px)', width: '100%' }}>
        <FamilyFlow
          persons={data.persons}
          isAdmin={isAdmin}
          onAddChild={onAddChild}
          onAddParent={onAddParent}
          onAddSpouse={onAddSpouse}
          onAddRoot={onAddRoot}
          onEdit={onEdit}
          onDelete={handleDeleteMember}
          onEditSpouse={onEditSpouse}
          onDeleteSpouse={handleDeleteSpouse}
          activeTapId={activeTapId}
          setActiveTapId={setActiveTapId}
        />
      </div>

      {addModal && (
        <AddMemberModal
          mode={addModal.mode}
          refNode={addModal.refNode}
          usedOrders={addModal.usedOrders ?? []}
          initialName={addModal.initialName}
          initialGender={addModal.initialGender}
          onSubmit={handleAddMember}
          onClose={() => { setAddModal(null); setActiveTapId(null) }}
        />
      )}

      {editModal && (
        <EditMemberModal
          person={editModal.person}
          usedOrders={editModal.usedOrders ?? []}
          onSave={handleEditMember}
          onClose={() => setEditModal(null)}
        />
      )}

      {showReview && (
        <ReviewPanel
          persons={data.persons}
          onApprove={handleApprove}
          onClose={() => setShowReview(false)}
        />
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}
