import { useState, useEffect } from 'react'
import './SystemMonitor.css'

function SystemMonitor() {
  const [memoryStats, setMemoryStats] = useState({
    total: 8.0,
    used: 3.2,
    available: 4.8,
    usage: 40
  })

  const [cpuStats, setCpuStats] = useState({
    usage: 25,
    cores: 4,
    frequency: 2.4,
    processes: 42
  })

  const [networkStats, setNetworkStats] = useState({
    status: 'Connected',
    downloadSpeed: 45.2,
    uploadSpeed: 12.8
  })

  useEffect(() => {
    const memoryInterval = setInterval(() => {
      const used = 3.2 + Math.random() * 0.5
      const total = 8.0
      const available = total - used
      const usage = ((used / total) * 100).toFixed(1)
      
      setMemoryStats({
        total,
        used,
        available,
        usage: parseFloat(usage)
      })
    }, 2000)

    const cpuInterval = setInterval(() => {
      const usage = 20 + Math.random() * 15
      const processes = 42 + Math.floor(Math.random() * 10)
      
      setCpuStats(prev => ({
        ...prev,
        usage: parseFloat(usage.toFixed(1)),
        processes
      }))
    }, 1500)

    const networkInterval = setInterval(() => {
      const downloadSpeed = 30 + Math.random() * 30
      const uploadSpeed = 10 + Math.random() * 10
      
      setNetworkStats({
        status: 'Connected',
        downloadSpeed: parseFloat(downloadSpeed.toFixed(1)),
        uploadSpeed: parseFloat(uploadSpeed.toFixed(1))
      })
    }, 3000)

    return () => {
      clearInterval(memoryInterval)
      clearInterval(cpuInterval)
      clearInterval(networkInterval)
    }
  }, [])

  return (
    <div className="system-monitor-container">
      <div className="system-monitor-header">
        <h2>System Monitor</h2>
        <p className="system-monitor-description">Real-time system performance overview</p>
      </div>

      <div className="system-monitor-grid">
        <div className="monitor-card">
          <div className="monitor-card-header">
            <span className="monitor-icon">💾</span>
            <span className="monitor-title">Memory</span>
          </div>
          <div className="monitor-stats">
            <div className="monitor-stat">
              <span className="monitor-stat-label">Used</span>
              <span className="monitor-stat-value">{memoryStats.used.toFixed(1)} GB</span>
            </div>
            <div className="monitor-stat">
              <span className="monitor-stat-label">Available</span>
              <span className="monitor-stat-value">{memoryStats.available.toFixed(1)} GB</span>
            </div>
          </div>
          <div className="monitor-progress">
            <div 
              className="monitor-progress-bar memory"
              style={{ width: `${memoryStats.usage}%` }}
            ></div>
          </div>
          <div className="monitor-percentage">{memoryStats.usage}%</div>
        </div>

        <div className="monitor-card">
          <div className="monitor-card-header">
            <span className="monitor-icon">⚡</span>
            <span className="monitor-title">CPU</span>
          </div>
          <div className="monitor-stats">
            <div className="monitor-stat">
              <span className="monitor-stat-label">Cores</span>
              <span className="monitor-stat-value">{cpuStats.cores}</span>
            </div>
            <div className="monitor-stat">
              <span className="monitor-stat-label">Processes</span>
              <span className="monitor-stat-value">{cpuStats.processes}</span>
            </div>
          </div>
          <div className="monitor-progress">
            <div 
              className="monitor-progress-bar cpu"
              style={{ width: `${cpuStats.usage}%` }}
            ></div>
          </div>
          <div className="monitor-percentage">{cpuStats.usage.toFixed(1)}%</div>
        </div>

        <div className="monitor-card">
          <div className="monitor-card-header">
            <span className="monitor-icon">🌐</span>
            <span className="monitor-title">Network</span>
          </div>
          <div className="monitor-stats">
            <div className="monitor-stat">
              <span className="monitor-stat-label">Status</span>
              <span className="monitor-stat-value connected">{networkStats.status}</span>
            </div>
            <div className="monitor-stat">
              <span className="monitor-stat-label">Download</span>
              <span className="monitor-stat-value">{networkStats.downloadSpeed} Mbps</span>
            </div>
            <div className="monitor-stat">
              <span className="monitor-stat-label">Upload</span>
              <span className="monitor-stat-value">{networkStats.uploadSpeed} Mbps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemMonitor

