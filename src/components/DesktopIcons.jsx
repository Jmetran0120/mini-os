import './DesktopIcons.css'

function DesktopIcons({ onOpenWindow }) {
  const desktopApps = [
    { id: 'file-manager', icon: '📁', label: 'Files', color: '#6366f1' },
    { id: 'notepad', icon: '📝', label: 'Notepad', color: '#8b5cf6' },
    { id: 'system-monitor', icon: '📊', label: 'Monitor', color: '#ec4899' },
    { id: 'clipboard-manager', icon: '📋', label: 'Clipboard', color: '#06b6d4' },
    { id: 'task-scheduler', icon: '📅', label: 'Tasks', color: '#f97316' },
    { id: 'calculator', icon: '🧮', label: 'Calculator', color: '#f59e0b' },
    { id: 'settings', icon: '⚙️', label: 'Settings', color: '#10b981' }
  ]

  const handleDoubleClick = (appId) => {
    onOpenWindow(appId)
  }

  return (
    <div className="desktop-icons">
      {desktopApps.map(app => (
        <div
          key={app.id}
          className="desktop-icon"
          onDoubleClick={() => handleDoubleClick(app.id)}
          title={app.label}
        >
          <div 
            className="desktop-icon-image"
            style={{ 
              background: `linear-gradient(135deg, ${app.color}20, ${app.color}40)`,
              borderColor: `${app.color}60`
            }}
          >
            <span className="desktop-icon-emoji">{app.icon}</span>
          </div>
          <div className="desktop-icon-label">{app.label}</div>
        </div>
      ))}
    </div>
  )
}

export default DesktopIcons

