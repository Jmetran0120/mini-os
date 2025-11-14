import { useState, useEffect } from 'react'
import './Taskbar.css'

function Taskbar({ onOpenWindow, onShutdown, minimizedWindows, onRestoreWindow, openWindows, currentWorkspace = 0 }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = () => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = () => {
    return time.toLocaleDateString()
  }

  const apps = [
    { id: 'file-manager', label: '📁 File Manager', icon: '📁' },
    { id: 'notepad', label: '📝 Notepad', icon: '📝' },
    { id: 'system-monitor', label: '📊 Monitor', icon: '📊' },
    { id: 'clipboard-manager', label: '📋 Clipboard', icon: '📋' },
    { id: 'task-scheduler', label: '📅 Tasks', icon: '📅' },
    { id: 'system-logs', label: '📜 Logs', icon: '📜' },
    { id: 'virtual-desktop', label: '🖥️ Desktops', icon: '🖥️' },
    { id: 'memory-manager', label: '💾 Memory', icon: '💾' },
    { id: 'processor-manager', label: '⚡ Processor', icon: '⚡' },
    { id: 'device-manager', label: '🖥️ Devices', icon: '🖥️' },
    { id: 'network-manager', label: '🌐 Network', icon: '🌐' },
    { id: 'security-manager', label: '🔒 Security', icon: '🔒' },
    { id: 'settings', label: '⚙️ Settings', icon: '⚙️' },
    { id: 'calculator', label: '🧮 Calculator', icon: '🧮' },
    { id: 'terminal', label: '💻 Terminal', icon: '💻' },
    { id: 'music-player', label: '🎵 Music', icon: '🎵' }
  ]

  const handleAppClick = (id) => {
    if (minimizedWindows.has(id)) {
      onRestoreWindow(id)
    } else if (openWindows[id]) {
      // Window is already open, could minimize it
    } else {
      onOpenWindow(id)
    }
  }

  return (
    <div className="taskbar">
      <div className="taskbar-left">
        <div className="taskbar-logo-section">
          <img src="/logo.png" alt="Logo" className="taskbar-logo" />
          <span className="taskbar-os-name">M</span>
        </div>
        <div className="taskbar-divider"></div>
        {apps.map(app => (
          <button
            key={app.id}
            className={`app-btn ${openWindows[app.id] ? 'active' : ''}`}
            onClick={() => handleAppClick(app.id)}
            title={app.label}
          >
            {app.icon} {app.label.split(' ')[1]}
          </button>
        ))}
        <div id="minimized-icons" className="minimized-icons">
          {Array.from(minimizedWindows).map(id => {
            const app = apps.find(a => a.id === id)
            if (!app) return null
            return (
              <button
                key={id}
                className="minimized-icon-btn"
                onClick={() => onRestoreWindow(id)}
                title={app.label}
              >
                {app.icon}
              </button>
            )
          })}
        </div>
      </div>
      <div className="taskbar-right">
        <div className="workspace-indicator" title="Current Desktop">
          🖥️ {currentWorkspace + 1}
        </div>
        <span id="clock">{formatDate()} {formatTime()}</span>
        <button id="shutdown-btn" onClick={onShutdown}>⏻ Shutdown</button>
      </div>
    </div>
  )
}

export default Taskbar

