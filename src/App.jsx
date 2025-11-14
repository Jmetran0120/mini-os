import { useState, useEffect } from 'react'
import BootScreen from './components/BootScreen'
import ShutdownScreen from './components/ShutdownScreen'
import Desktop from './components/Desktop'
import './styles/index.css'

function App() {
  const [isBooting, setIsBooting] = useState(true)
  const [isShuttingDown, setIsShuttingDown] = useState(false)
  const [showDesktop, setShowDesktop] = useState(false)

  useEffect(() => {
    // Boot sequence
    const bootTimer = setTimeout(() => {
      setIsBooting(false)
      setShowDesktop(true)
    }, 2000)

    return () => clearTimeout(bootTimer)
  }, [])

  const handleShutdown = () => {
    setIsShuttingDown(true)
    setShowDesktop(false)
  }

  if (isBooting) {
    return <BootScreen />
  }

  if (isShuttingDown) {
    return <ShutdownScreen />
  }

  if (showDesktop) {
    return <Desktop onShutdown={handleShutdown} />
  }

  return null
}

export default App

