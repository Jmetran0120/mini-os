import { useState, useEffect } from 'react'
import './Manager.css'

function NetworkManager() {
  const [stats, setStats] = useState({
    status: 'Connected',
    downloadSpeed: 45.2,
    uploadSpeed: 12.8,
    dataSent: 2.4,
    dataReceived: 8.7
  })

  const [connections] = useState([
    '192.168.1.1 - Router (Active)',
    '192.168.1.100 - Local Server (Active)',
    '8.8.8.8 - DNS Server (Active)'
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      const downloadSpeed = 30 + Math.random() * 30
      const uploadSpeed = 10 + Math.random() * 10
      const dataSent = 2.0 + Math.random() * 1.0
      const dataReceived = 8.0 + Math.random() * 2.0
      
      setStats({
        status: 'Connected',
        downloadSpeed: parseFloat(downloadSpeed.toFixed(1)),
        uploadSpeed: parseFloat(uploadSpeed.toFixed(1)),
        dataSent: parseFloat(dataSent.toFixed(1)),
        dataReceived: parseFloat(dataReceived.toFixed(1))
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Network Manager</h2>
        <p className="manager-description">Manages communication and data transfer</p>
      </div>

      <div className="manager-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Status</div>
            <div className="stat-value" style={{ fontSize: '16px', color: 'rgba(34, 197, 94, 0.9)' }}>
              {stats.status}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Download Speed</div>
            <div className="stat-value">{stats.downloadSpeed} Mbps</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Upload Speed</div>
            <div className="stat-value">{stats.uploadSpeed} Mbps</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Data Sent</div>
            <div className="stat-value">{stats.dataSent} GB</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Data Received</div>
            <div className="stat-value">{stats.dataReceived} GB</div>
          </div>
        </div>

        <div className="item-list">
          <h3>Active Connections</h3>
          <ul>
            {connections.map((conn, index) => (
              <li key={index}>{conn}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default NetworkManager

