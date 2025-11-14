import { useState, useEffect } from 'react'
import './Manager.css'

function DeviceManager() {
  const [devices, setDevices] = useState([
    { name: 'Keyboard', status: 'connected', type: 'Input' },
    { name: 'Mouse', status: 'connected', type: 'Input' },
    { name: 'Display', status: 'connected', type: 'Output' },
    { name: 'Audio Output', status: 'connected', type: 'Output' },
    { name: 'USB Drive', status: 'disconnected', type: 'Storage' },
    { name: 'Printer', status: 'disconnected', type: 'Output' }
  ])

  const refreshDevices = () => {
    setDevices(prev => prev.map(device => {
      if (device.name === 'USB Drive' && Math.random() > 0.7) {
        return {
          ...device,
          status: device.status === 'connected' ? 'disconnected' : 'connected'
        }
      }
      return device
    }))
  }

  useEffect(() => {
    refreshDevices()
  }, [])

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Device Manager</h2>
        <p className="manager-description">Manages input/output devices</p>
      </div>

      <div className="manager-content">
        <div className="item-list">
          <h3>Connected Devices</h3>
          <div>
            {devices.map((device, index) => (
              <div key={index} className="device-item">
                <div className="device-info">
                  <div className="device-name">{device.name}</div>
                  <div className={`device-status ${device.status}`}>
                    {device.status === 'connected' ? '● Connected' : '○ Disconnected'} - {device.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="manager-btn" onClick={refreshDevices}>
          🔄 Refresh Devices
        </button>
      </div>
    </div>
  )
}

export default DeviceManager

