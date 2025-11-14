import { useState, useEffect } from 'react'
import './SystemLogs.css'

function SystemLogs() {
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Load saved logs
    const saved = localStorage.getItem('systemLogs')
    if (saved) {
      setLogs(JSON.parse(saved))
    } else {
      // Initialize with some default logs
      const initialLogs = [
        { id: 1, timestamp: new Date().toISOString(), level: 'info', message: 'System initialized', source: 'System' },
        { id: 2, timestamp: new Date(Date.now() - 60000).toISOString(), level: 'info', message: 'Desktop loaded', source: 'Desktop' },
        { id: 3, timestamp: new Date(Date.now() - 120000).toISOString(), level: 'success', message: 'File system mounted', source: 'FileSystem' }
      ]
      setLogs(initialLogs)
    }

    // Simulate new log entries
    const logInterval = setInterval(() => {
      const logTypes = [
        { level: 'info', message: 'Memory check completed', source: 'MemoryManager' },
        { level: 'info', message: 'Network connection stable', source: 'NetworkManager' },
        { level: 'success', message: 'File saved successfully', source: 'FileManager' },
        { level: 'warning', message: 'High CPU usage detected', source: 'ProcessorManager' },
        { level: 'info', message: 'Window opened', source: 'WindowManager' }
      ]

      if (Math.random() > 0.7) {
        const randomLog = logTypes[Math.floor(Math.random() * logTypes.length)]
        const newLog = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...randomLog
        }
        setLogs(prev => {
          const updated = [newLog, ...prev].slice(0, 200) // Keep last 200 logs
          localStorage.setItem('systemLogs', JSON.stringify(updated))
          return updated
        })
      }
    }, 5000)

    return () => clearInterval(logInterval)
  }, [])

  const addLog = (level, message, source = 'System') => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      level,
      message,
      source
    }
    setLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 200)
      localStorage.setItem('systemLogs', JSON.stringify(updated))
      return updated
    })
  }

  const clearLogs = () => {
    if (confirm('Clear all system logs?')) {
      setLogs([])
      localStorage.removeItem('systemLogs')
    }
  }

  const exportLogs = () => {
    const logText = logs.map(log => 
      `[${new Date(log.timestamp).toLocaleString()}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`
    ).join('\n')
    
    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.level === filter
    const matchesSearch = !searchQuery || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getLevelIcon = (level) => {
    const icons = {
      info: 'ℹ️',
      success: '✓',
      warning: '⚠️',
      error: '✕'
    }
    return icons[level] || 'ℹ️'
  }

  const getLevelColor = (level) => {
    const colors = {
      info: 'rgba(99, 102, 241, 0.3)',
      success: 'rgba(34, 197, 94, 0.3)',
      warning: 'rgba(251, 146, 60, 0.3)',
      error: 'rgba(239, 68, 68, 0.3)'
    }
    return colors[level] || colors.info
  }

  return (
    <div className="system-logs-container">
      <div className="system-logs-header">
        <h2>System Logs</h2>
        <p className="system-logs-description">View system activity and events</p>
      </div>

      <div className="system-logs-toolbar">
        <div className="system-logs-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'info' ? 'active' : ''}`}
            onClick={() => setFilter('info')}
          >
            ℹ️ Info
          </button>
          <button
            className={`filter-btn ${filter === 'success' ? 'active' : ''}`}
            onClick={() => setFilter('success')}
          >
            ✓ Success
          </button>
          <button
            className={`filter-btn ${filter === 'warning' ? 'active' : ''}`}
            onClick={() => setFilter('warning')}
          >
            ⚠ Warning
          </button>
          <button
            className={`filter-btn ${filter === 'error' ? 'active' : ''}`}
            onClick={() => setFilter('error')}
          >
            ✕ Error
          </button>
        </div>
        <div className="system-logs-search">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="system-logs-search-input"
          />
        </div>
        <div className="system-logs-actions">
          <button className="system-logs-btn" onClick={exportLogs}>
            💾 Export
          </button>
          <button className="system-logs-btn" onClick={clearLogs}>
            🗑️ Clear
          </button>
        </div>
      </div>

      <div className="system-logs-content">
        <div className="system-logs-stats">
          <div className="log-stat">
            <span className="log-stat-label">Total Logs</span>
            <span className="log-stat-value">{logs.length}</span>
          </div>
          <div className="log-stat">
            <span className="log-stat-label">Filtered</span>
            <span className="log-stat-value">{filteredLogs.length}</span>
          </div>
        </div>

        <div className="system-logs-list">
          {filteredLogs.length === 0 ? (
            <div className="system-logs-empty">No logs found</div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                className="system-log-item"
                style={{ borderLeftColor: getLevelColor(log.level) }}
              >
                <div className="system-log-header">
                  <span className="system-log-icon">{getLevelIcon(log.level)}</span>
                  <span className="system-log-level">{log.level.toUpperCase()}</span>
                  <span className="system-log-source">[{log.source}]</span>
                  <span className="system-log-time">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="system-log-message">{log.message}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default SystemLogs

