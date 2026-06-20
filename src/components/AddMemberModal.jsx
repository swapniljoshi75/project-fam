import { useState } from 'react'

const MODE_TITLE = {
  root:   ()    => 'Add First Member',
  child:  (ref) => `Add Child of ${ref?.name}`,
  spouse: (ref) => `Add Spouse of ${ref?.name}`,
  parent: (ref) => `Add Parent of ${ref?.name}`,
}

const MODE_HINT = {
  parent: (ref) => `${ref?.name} will become their child.`,
}

export default function AddMemberModal({ mode, refNode, onSubmit, onClose }) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('male')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) { setError('Name is required.'); return }

    switch (mode) {
      case 'root':
        onSubmit({ name, gender, parentId: null, spouseOfId: null })
        break
      case 'child':
        onSubmit({ name, gender, parentId: refNode.id, spouseOfId: null })
        break
      case 'spouse':
        onSubmit({ name, gender, parentId: null, spouseOfId: refNode.id })
        break
      case 'parent':
        onSubmit({ name, gender, parentId: null, spouseOfId: null, isParentOf: refNode.id })
        break
    }
  }

  const title = MODE_TITLE[mode]?.(refNode) ?? 'Add Member'
  const hint  = MODE_HINT[mode]?.(refNode) ?? null

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">

          {hint && (
            <p className="form-hint" style={{ background: '#F0F9FF', padding: '8px 12px', borderRadius: 8, color: '#0369A1' }}>
              {hint}
            </p>
          )}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              placeholder="Enter full name"
              value={name}
              onChange={e => {
                const filtered = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                setName(filtered.replace(/\b\w/g, c => c.toUpperCase()))
                setError('')
              }}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <div className="radio-group">
              <label className={`radio-option ${gender === 'male' ? 'selected-male' : ''}`}>
                <input type="radio" value="male" checked={gender === 'male'} onChange={() => setGender('male')} />
                ♂ Male
              </label>
              <label className={`radio-option ${gender === 'female' ? 'selected-female' : ''}`}>
                <input type="radio" value="female" checked={gender === 'female'} onChange={() => setGender('female')} />
                ♀ Female
              </label>
            </div>
          </div>

          {error && <p style={{ color: '#DC2626', fontSize: 13 }}>{error}</p>}

          <div className="form-actions">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>+ Add Member</button>
          </div>
        </div>
      </div>
    </div>
  )
}
