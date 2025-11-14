import { useState, useEffect } from 'react'
import TopBar from './TopBar'
import Taskbar from './Taskbar'
import FileManager from './FileManager'
import MemoryManager from './MemoryManager'
import ProcessorManager from './ProcessorManager'
import DeviceManager from './DeviceManager'
import NetworkManager from './NetworkManager'
import SecurityManager from './SecurityManager'
import Settings from './Settings'
import Calculator from './Calculator'
import Terminal from './Terminal'
import MusicPlayer from './MusicPlayer'
import Notepad from './Notepad'
import ImageViewer from './ImageViewer'
import SystemMonitor from './SystemMonitor'
import ClipboardManager from './ClipboardManager'
import TaskScheduler from './TaskScheduler'
import SystemLogs from './SystemLogs'
import VirtualDesktop from './VirtualDesktop'
import QuickSearch from './QuickSearch'
import DesktopIcons from './DesktopIcons'
import NotificationSystem from './NotificationSystem'
import Window from './Window'
import { useNotifications } from '../hooks/useNotifications'
import './Desktop.css'

function Desktop({ onShutdown }) {
  const [openWindows, setOpenWindows] = useState({})
  const [minimizedWindows, setMinimizedWindows] = useState(new Set())
  const [windowProps, setWindowProps] = useState({})
  const [currentWorkspace, setCurrentWorkspace] = useState(0)
  const [workspaces, setWorkspaces] = useState([
    { windows: [] },
    { windows: [] },
    { windows: [] },
    { windows: [] }
  ])
  const [showQuickSearch, setShowQuickSearch] = useState(false)
  const { notifications, showNotification, removeNotification } = useNotifications()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K for Quick Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowQuickSearch(true)
      }
      
      // Cmd/Ctrl + 1-4 for workspace switching
      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
        e.preventDefault()
        const workspaceIndex = parseInt(e.key) - 1
        if (workspaceIndex < workspaces.length) {
          setCurrentWorkspace(workspaceIndex)
          showNotification(`Switched to Desktop ${workspaceIndex + 1}`, 'info', 2000)
        }
      }
      
      // Cmd/Ctrl + Arrow keys for workspace navigation
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentWorkspace(prev => {
          const newIndex = Math.max(0, prev - 1)
          showNotification(`Switched to Desktop ${newIndex + 1}`, 'info', 2000)
          return newIndex
        })
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowRight') {
        e.preventDefault()
        setCurrentWorkspace(prev => {
          const newIndex = Math.min(workspaces.length - 1, prev + 1)
          showNotification(`Switched to Desktop ${newIndex + 1}`, 'info', 2000)
          return newIndex
        })
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [workspaces.length, showNotification])

  const openWindow = (id, props = {}) => {
    setOpenWindows(prev => ({ ...prev, [id]: true }))
    if (Object.keys(props).length > 0) {
      setWindowProps(prev => ({ ...prev, [id]: props }))
    }
    setMinimizedWindows(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
    showNotification(`${getWindowTitle(id)} opened`, 'info', 2000)
  }

  const closeWindow = (id) => {
    setOpenWindows(prev => {
      const newObj = { ...prev }
      delete newObj[id]
      return newObj
    })
    setWindowProps(prev => {
      const newObj = { ...prev }
      delete newObj[id]
      return newObj
    })
    setMinimizedWindows(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const minimizeWindow = (id) => {
    setMinimizedWindows(prev => new Set(prev).add(id))
  }

  const restoreWindow = (id) => {
    setMinimizedWindows(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const windowComponents = {
    'file-manager': FileManager,
    'memory-manager': MemoryManager,
    'processor-manager': ProcessorManager,
    'device-manager': DeviceManager,
    'network-manager': NetworkManager,
    'security-manager': SecurityManager,
    'settings': Settings,
    'calculator': Calculator,
    'terminal': Terminal,
    'music-player': MusicPlayer,
    'notepad': Notepad,
    'image-viewer': ImageViewer,
    'system-monitor': SystemMonitor,
    'clipboard-manager': ClipboardManager,
    'task-scheduler': TaskScheduler,
    'system-logs': SystemLogs,
    'virtual-desktop': VirtualDesktop
  }

  const handleSwitchWorkspace = (index) => {
    // Save current workspace state
    const currentWindows = Object.keys(openWindows).map(id => ({
      id,
      icon: getWindowTitle(id).split(' ')[0]
    }))
    
    setWorkspaces(prev => {
      const updated = [...prev]
      updated[currentWorkspace] = { windows: currentWindows }
      return updated
    })
    
    // Clear current windows and load new workspace
    setOpenWindows({})
    setMinimizedWindows(new Set())
    setWindowProps({})
    setCurrentWorkspace(index)
    
    showNotification(`Switched to Desktop ${index + 1}`, 'info', 2000)
  }


  const getWindowSize = (id) => {
    const sizes = {
      'file-manager': { width: 800, height: 550 },
      'calculator': { width: 380, height: 480 },
      'terminal': { width: 600, height: 450 },
      'notepad': { width: 700, height: 500 },
      'image-viewer': { width: 800, height: 600 },
      'system-monitor': { width: 900, height: 600 },
      'clipboard-manager': { width: 700, height: 600 },
      'task-scheduler': { width: 1000, height: 700 },
      'system-logs': { width: 900, height: 600 },
      'virtual-desktop': { width: 800, height: 600 }
    }
    return sizes[id] || { width: 600, height: 500 }
  }

  return (
    <div className="desktop">
      <div className="desktop-logo-container">
        <img src="/logo.png" alt="Logo" className="desktop-logo" />
      </div>
      
      <DesktopIcons onOpenWindow={openWindow} />
      
      <TopBar />
      
      {Object.keys(openWindows).map((id) => {
        if (minimizedWindows.has(id)) return null
        const Component = windowComponents[id]
        if (!Component) return null
        
        const props = windowProps[id] || {}
        const size = getWindowSize(id)
        
        // Special handling for components that need showNotification
        const componentProps = id === 'task-scheduler' 
          ? { showNotification }
          : id === 'virtual-desktop'
          ? { currentWorkspace, onSwitchWorkspace: handleSwitchWorkspace, workspaces }
          : props
        
        return (
          <Window
            key={id}
            id={id}
            title={getWindowTitle(id)}
            onClose={() => {
              closeWindow(id)
              showNotification(`${getWindowTitle(id)} closed`, 'info', 2000)
            }}
            onMinimize={() => minimizeWindow(id)}
            defaultSize={size}
          >
            <Component {...componentProps} />
          </Window>
        )
      })}
      
      <QuickSearch
        isOpen={showQuickSearch}
        onClose={() => setShowQuickSearch(false)}
        onOpenWindow={openWindow}
      />
      
      <NotificationSystem 
        notifications={notifications}
        onRemove={removeNotification}
      />
      
      <Taskbar
        onOpenWindow={openWindow}
        onShutdown={onShutdown}
        minimizedWindows={minimizedWindows}
        onRestoreWindow={restoreWindow}
        openWindows={openWindows}
        currentWorkspace={currentWorkspace}
      />
    </div>
  )
}

function getWindowTitle(id) {
  const titles = {
    'file-manager': '📁 File Manager',
    'memory-manager': '💾 Memory Manager',
    'processor-manager': '⚡ Processor Manager',
    'device-manager': '🖥️ Device Manager',
    'network-manager': '🌐 Network Manager',
    'security-manager': '🔒 Security Manager',
    'settings': '⚙️ Settings',
    'calculator': '🧮 Calculator',
    'terminal': '💻 Terminal',
    'music-player': '🎵 Music Player',
    'notepad': '📝 Notepad',
    'image-viewer': '🖼️ Image Viewer',
    'system-monitor': '📊 System Monitor',
    'clipboard-manager': '📋 Clipboard Manager',
    'task-scheduler': '📅 Task Scheduler',
    'system-logs': '📜 System Logs',
    'virtual-desktop': '🖥️ Virtual Desktops'
  }
  return titles[id] || id
}

export default Desktop

