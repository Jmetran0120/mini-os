import { useState, useEffect } from 'react'
import './ShutdownScreen.css'

function ShutdownScreen() {
  const [message, setMessage] = useState('Please wait while the system shuts down')

  useEffect(() => {
    const messages = [
      'Saving system state...',
      'Closing applications...',
      'Finalizing shutdown...',
      'System shutdown complete'
    ]

    messages.forEach((msg, index) => {
      setTimeout(() => {
        setMessage(msg)
        if (index === messages.length - 1) {
          const title = document.querySelector('.shutdown-content h1')
          if (title) title.textContent = 'Shutdown Complete'
          const loader = document.querySelector('.shutdown-loader')
          if (loader) loader.style.display = 'none'
        }
      }, (index + 1) * 1500)
    })
  }, [])

  return (
    <div className="shutdown-screen">
      <div className="shutdown-content">
        <img src="/logo.png" alt="Logo" className="shutdown-logo" />
        <div className="shutdown-loader"></div>
        <h1>Shutting down...</h1>
        <p className="shutdown-message">{message}</p>
      </div>
    </div>
  )
}

export default ShutdownScreen

