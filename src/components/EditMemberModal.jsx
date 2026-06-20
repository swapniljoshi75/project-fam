import { useState } from 'react'

export default function EditMemberModal({ person, usedOrders = [], onSave, onClose }) {
  const [name, setName]           = useState(person.name || '')
  const [gender, setGender]       = useState(person.gender || null)
  const [birthOrder, setBirthOrder] = useState(person.siblingOrder ?? null)

  const showBirthOrder = person.isNode && !!person.parentId

  const isValid =
    name.trim() &&
    gender &&
    (!showBirthOrder || birthOrder != null)

  const handleSubmit = () => {
    if (!isValid) return
    onSave({
      ...person,
      name: name.trim(),
      gender,
      ...(showBirthOrder ? { siblingOrder: birthOrder } : {}),
    })
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Edit Member</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">

          <div className="form-group">
            <label className="form-label">Full Name <span style={{ color: '#EF4444' }}>*</span></label>
            <input
              className="form-input"
              value={name}
              onChange={e => {
                const filtered = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                setName(filtered.replace(/\b\w/g, c => c.toUpperCase()))
              }}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gender <span style={{ color: '#EF4444' }}>*</span></label>
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

          {showBirthOrder && (
            <div className="form-group">
              <label className="form-label">Birth Order <span style={{ color: '#EF4444' }}>*</span></label>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
                  const used     = usedOrders.includes(n)
                  const selected = birthOrder === n
                  return (
                    <button
                      key={n}
                      type="button"
                      disabled={used}
                      onClick={() => setBirthOrder(n)}
                      style={{
                        width: 28, height: 28,
                        borderRadius: '50%',
                        border: selected
                          ? '2px solid #3B82F6'
                          : `1.5px solid ${used ? '#E2E8F0' : '#CBD5E1'}`,
                        background: selected ? '#3B82F6' : used ? '#F8FAFC' : '#fff',
                        color: selected ? '#fff' : used ? '#D1D5DB' : '#374151',
                        fontWeight: selected ? 700 : 500,
                        fontSize: 12,
                        cursor: used ? 'not-allowed' : 'pointer',
                        transition: 'background 0.12s, color 0.12s',
                        flexShrink: 0,
                        padding: 0,
                      }}
                    >
                      {n}
                    </button>
                  )
                })}
              </div>
              {usedOrders.length > 0 && (
                <p style={{ fontSize: 11, color: '#94A3B8', margin: '6px 0 0' }}>
                  Grayed numbers are taken by existing siblings.
                </p>
              )}
            </div>
          )}

          <div className="form-actions">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!isValid}
              style={{ opacity: isValid ? 1 : 0.45, cursor: isValid ? 'pointer' : 'not-allowed' }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
