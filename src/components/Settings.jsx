import { useState, useEffect } from 'react'
import './Manager.css'

function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [username, setUsername] = useState(localStorage.getItem('username') || '')

  useEffect(() => {
    localStorage.setItem('theme', theme)
    localStorage.setItem('username', username)
  }, [theme, username])

  const saveUsername = () => {
    if (!username.trim()) {
      alert('Please enter a username.')
      return
    }
    localStorage.setItem('username', username)
    alert(`Username saved as: ${username}`)
  }

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Settings</h2>
        <p className="manager-description">System settings and preferences</p>
      </div>

      <div className="manager-content">
        <div className="item-list">
          <h3>Appearance</h3>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Theme:
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        <div className="item-list">
          <h3>User</h3>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Username:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter name"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontFamily: 'inherit',
                marginBottom: '10px'
              }}
            />
            <button className="manager-btn" onClick={saveUsername}>
              Save Username
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

