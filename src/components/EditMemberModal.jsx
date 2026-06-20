import { useState } from 'react'

export default function EditMemberModal({ person, onSave, onClose }) {
  const [name, setName] = useState(person.name || '')
  const [gender, setGender] = useState(person.gender || 'male')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) { setError('Name is required.'); return }
    onSave({ ...person, name: name.trim(), gender })
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
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              value={name}
              onChange={e => {
                const filtered = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                const capitalized = filtered.replace(/\b\w/g, c => c.toUpperCase())
                setName(capitalized)
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
            <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
