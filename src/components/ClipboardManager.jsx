import { useState, useEffect, useCallback } from 'react'
import './ClipboardManager.css'

function ClipboardManager() {
  const [clipboardHistory, setClipboardHistory] = useState(() => {
    const saved = localStorage.getItem('clipboardHistory')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('clipboardHistory', JSON.stringify(clipboardHistory))
  }, [clipboardHistory])

  const addToClipboard = (text) => {
    if (!text || text.trim() === '') return
    
    const newItem = {
      id: Date.now(),
      text: text.trim(),
      timestamp: new Date().toISOString(),
      type: detectType(text.trim())
    }

    setClipboardHistory(prev => {
      // Remove duplicates
      const filtered = prev.filter(item => item.text !== newItem.text)
      return [newItem, ...filtered].slice(0, 50) // Keep last 50 items
    })
  }

  const detectType = useCallback((text) => {
    if (text.match(/^https?:\/\//)) return 'url'
    if (text.match(/^\d+$/)) return 'number'
    if (text.match(/^[\w.-]+@[\w.-]+\.\w+$/)) return 'email'
    if (text.length > 100) return 'long-text'
    return 'text'
  }, [])

  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      addToClipboard(text)
      return true
    } catch (err) {
      console.error('Failed to copy:', err)
      return false
    }
  }

  // Listen for clipboard changes (limited browser support)
  useEffect(() => {
    const handlePaste = (e) => {
      const text = e.clipboardData?.getData('text')
      if (text && text.trim()) {
        const detectTypeLocal = (txt) => {
          if (txt.match(/^https?:\/\//)) return 'url'
          if (txt.match(/^\d+$/)) return 'number'
          if (txt.match(/^[\w.-]+@[\w.-]+\.\w+$/)) return 'email'
          if (txt.length > 100) return 'long-text'
          return 'text'
        }
        
        const newItem = {
          id: Date.now(),
          text: text.trim(),
          timestamp: new Date().toISOString(),
          type: detectTypeLocal(text.trim())
        }
        setClipboardHistory(prev => {
          const filtered = prev.filter(item => item.text !== newItem.text)
          return [newItem, ...filtered].slice(0, 50)
        })
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [])

  const deleteItem = (id) => {
    setClipboardHistory(prev => prev.filter(item => item.id !== id))
  }

  const clearAll = () => {
    if (confirm('Clear all clipboard history?')) {
      setClipboardHistory([])
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  const getTypeIcon = (type) => {
    const icons = {
      url: '🔗',
      email: '📧',
      number: '🔢',
      'long-text': '📄',
      text: '📋'
    }
    return icons[type] || '📋'
  }

  return (
    <div className="clipboard-manager-container">
      <div className="clipboard-manager-header">
        <h2>Clipboard Manager</h2>
        <p className="clipboard-manager-description">Manage your copy/paste history</p>
      </div>

      <div className="clipboard-manager-toolbar">
        <button className="clipboard-btn" onClick={clearAll} disabled={clipboardHistory.length === 0}>
          🗑️ Clear All
        </button>
        <div className="clipboard-count">
          {clipboardHistory.length} items
        </div>
      </div>

      <div className="clipboard-manager-content">
        {clipboardHistory.length === 0 ? (
          <div className="clipboard-empty">
            <div className="clipboard-empty-icon">📋</div>
            <div className="clipboard-empty-text">Clipboard history is empty</div>
            <div className="clipboard-empty-hint">Copy some text to see it here</div>
          </div>
        ) : (
          <div className="clipboard-list">
            {clipboardHistory.map((item) => (
              <div key={item.id} className="clipboard-item">
                <div className="clipboard-item-header">
                  <span className="clipboard-item-type">{getTypeIcon(item.type)}</span>
                  <span className="clipboard-item-time">{formatTime(item.timestamp)}</span>
                </div>
                <div className="clipboard-item-text">{item.text}</div>
                <div className="clipboard-item-actions">
                  <button
                    className="clipboard-action-btn"
                    onClick={() => copyToClipboard(item.text)}
                    title="Copy again"
                  >
                    📋 Copy
                  </button>
                  <button
                    className="clipboard-action-btn delete"
                    onClick={() => deleteItem(item.id)}
                    title="Delete"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ClipboardManager

