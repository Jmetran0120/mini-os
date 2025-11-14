import { useState, useEffect } from 'react'
import './Manager.css'

function MemoryManager() {
  const [stats, setStats] = useState({
    total: 8.0,
    used: 3.2,
    available: 4.8,
    usage: 40
  })

  const [processes] = useState([
    { name: 'Mini OS System', memory: '1.2 GB' },
    { name: 'Browser Process', memory: '850 MB' },
    { name: 'File Manager', memory: '320 MB' },
    { name: 'Memory Manager', memory: '180 MB' },
    { name: 'Network Manager', memory: '150 MB' }
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      const used = 3.2 + Math.random() * 0.5
      const total = 8.0
      const available = total - used
      const usage = ((used / total) * 100).toFixed(1)
      
      setStats({
        total,
        used,
        available,
        usage: parseFloat(usage)
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Memory Manager</h2>
        <p className="manager-description">Allocates and tracks RAM usage</p>
      </div>

      <div className="manager-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total RAM</div>
            <div className="stat-value">{stats.total.toFixed(1)} GB</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Used RAM</div>
            <div className="stat-value">{stats.used.toFixed(1)} GB</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Available RAM</div>
            <div className="stat-value">{stats.available.toFixed(1)} GB</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Usage</div>
            <div className="stat-value">{stats.usage}%</div>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-label">RAM Usage</div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${stats.usage}%` }}
            ></div>
          </div>
        </div>

        <div className="process-list">
          <h3>Top Memory Processes</h3>
          <ul>
            {processes.map((proc, index) => (
              <li key={index}>
                <span>{proc.name}</span>
                <span>{proc.memory}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default MemoryManager

