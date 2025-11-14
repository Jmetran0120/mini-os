import { useState, useRef, useEffect } from 'react'
import './Window.css'

function Window({ id, title, children, onClose, onMinimize, defaultPosition = { x: 100, y: 80 }, defaultSize = { width: 600, height: 500 } }) {
  const [position, setPosition] = useState(defaultPosition)
  const [size, setSize] = useState(defaultSize)
  const [isDragging, setIsDragging] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const windowRef = useRef(null)

  const handleMouseDown = (e) => {
    if (e.target.closest('.window-controls')) return
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || isMaximized) return
      setPosition({
        x: Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - size.width)),
        y: Math.max(40, Math.min(e.clientY - dragOffset.y, window.innerHeight - 100 - size.height))
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, isMaximized, size])

  const handleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false)
      setSize(defaultSize)
      setPosition(defaultPosition)
    } else {
      setIsMaximized(true)
      setPosition({ x: 0, y: 40 })
      setSize({ width: window.innerWidth, height: window.innerHeight - 90 })
    }
  }

  const windowStyle = isMaximized
    ? {
        top: '40px',
        left: '0',
        width: '100%',
        height: 'calc(100% - 90px)',
        borderRadius: '0'
      }
    : {
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`
      }

  return (
    <div
      ref={windowRef}
      className={`window ${isMaximized ? 'maximized' : ''}`}
      style={windowStyle}
    >
      <div
        className="window-header"
        onMouseDown={handleMouseDown}
      >
        <span>{title}</span>
        <div className="window-controls">
          <button className="min-btn" onClick={onMinimize}>—</button>
          <button className="max-btn" onClick={handleMaximize}>⬜</button>
          <button className="close-btn" onClick={onClose}>X</button>
        </div>
      </div>
      <div className="window-body">
        {children}
      </div>
    </div>
  )
}

export default Window

