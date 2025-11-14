import { useState, useEffect } from 'react'
import './Manager.css'

function ProcessorManager() {
  const [stats, setStats] = useState({
    usage: 25,
    cores: 4,
    frequency: 2.4,
    processes: 42
  })

  const [cpuProcesses] = useState([
    { name: 'System Idle', usage: '45%' },
    { name: 'Mini OS Kernel', usage: '12%' },
    { name: 'Memory Manager', usage: '8%' },
    { name: 'Network Manager', usage: '5%' },
    { name: 'File Manager', usage: '3%' }
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      const usage = 20 + Math.random() * 15
      const processes = 42 + Math.floor(Math.random() * 10)
      
      setStats(prev => ({
        ...prev,
        usage: parseFloat(usage.toFixed(1)),
        processes
      }))
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Processor Manager</h2>
        <p className="manager-description">Controls CPU use and process scheduling</p>
      </div>

      <div className="manager-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">CPU Usage</div>
            <div className="stat-value">{stats.usage.toFixed(1)}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Cores</div>
            <div className="stat-value">{stats.cores}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Frequency</div>
            <div className="stat-value">{stats.frequency} GHz</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Processes</div>
            <div className="stat-value">{stats.processes}</div>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-label">CPU Usage</div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${stats.usage}%` }}
            ></div>
          </div>
        </div>

        <div className="process-list">
          <h3>Top CPU Processes</h3>
          <ul>
            {cpuProcesses.map((proc, index) => (
              <li key={index}>
                <span>{proc.name}</span>
                <span>{proc.usage}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ProcessorManager

