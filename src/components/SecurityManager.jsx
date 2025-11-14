import { useState } from 'react'
import './Manager.css'

function SecurityManager() {
  const [scanResults, setScanResults] = useState(null)
  const [isScanning, setIsScanning] = useState(false)

  const [logs] = useState([
    '[2025-11-09 15:30:22] Firewall: Allowed connection to 192.168.1.1',
    '[2025-11-09 15:28:15] Security: System scan completed - No threats',
    '[2025-11-09 15:25:10] Firewall: Blocked suspicious connection attempt',
    '[2025-11-09 15:20:05] Security: User authentication successful'
  ])

  const runSecurityScan = () => {
    setIsScanning(true)
    setScanResults('Scanning system...')

    setTimeout(() => {
      setIsScanning(false)
      setScanResults('✓ Scan complete: No threats detected\nScanned: 12,847 files\nTime: 2.3 seconds')
    }, 2000)
  }

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Security Manager</h2>
        <p className="manager-description">Protects system and user data</p>
      </div>

      <div className="manager-content">
        <div className="security-grid">
          <div className="security-card">
            <div className="security-icon">🛡️</div>
            <div className="security-info">
              <div className="security-label">System Status</div>
              <div className="security-value secure">Secure</div>
            </div>
          </div>
          <div className="security-card">
            <div className="security-icon">🔐</div>
            <div className="security-info">
              <div className="security-label">Firewall</div>
              <div className="security-value active">Active</div>
            </div>
          </div>
          <div className="security-card">
            <div className="security-icon">🦠</div>
            <div className="security-info">
              <div className="security-label">Threats Detected</div>
              <div className="security-value">0</div>
            </div>
          </div>
        </div>

        <div className="item-list">
          <h3>Security Scan</h3>
          <button 
            className="manager-btn" 
            onClick={runSecurityScan}
            disabled={isScanning}
          >
            🔍 Run Full System Scan
          </button>
          {scanResults && (
            <div className={`scan-results ${isScanning ? 'scanning' : 'complete'}`}>
              {scanResults.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          )}
        </div>

        <div className="item-list">
          <h3>Security Logs</h3>
          <ul className="logs-list">
            {logs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SecurityManager

