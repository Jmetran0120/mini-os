import { useState, useEffect, useRef } from 'react'
import './QuickSearch.css'

function QuickSearch({ isOpen, onClose, onOpenWindow }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  const searchItems = [
    { id: 'file-manager', label: 'File Manager', icon: '📁', category: 'Apps' },
    { id: 'notepad', label: 'Notepad', icon: '📝', category: 'Apps' },
    { id: 'system-monitor', label: 'System Monitor', icon: '📊', category: 'Apps' },
    { id: 'calculator', label: 'Calculator', icon: '🧮', category: 'Apps' },
    { id: 'settings', label: 'Settings', icon: '⚙️', category: 'Apps' },
    { id: 'terminal', label: 'Terminal', icon: '💻', category: 'Apps' },
    { id: 'memory-manager', label: 'Memory Manager', icon: '💾', category: 'System' },
    { id: 'processor-manager', label: 'Processor Manager', icon: '⚡', category: 'System' },
    { id: 'network-manager', label: 'Network Manager', icon: '🌐', category: 'System' },
    { id: 'security-manager', label: 'Security Manager', icon: '🔒', category: 'System' }
  ]

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex])
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, selectedIndex])

  const filteredItems = query
    ? searchItems.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : searchItems

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleSelect = (item) => {
    onOpenWindow(item.id)
    onClose()
    setQuery('')
  }

  if (!isOpen) return null

  return (
    <div className="quick-search-overlay" onClick={onClose}>
      <div className="quick-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="quick-search-header">
          <span className="quick-search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="quick-search-input"
            placeholder="Search apps, files, and more..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <div className="quick-search-results">
          {filteredItems.length === 0 ? (
            <div className="quick-search-empty">No results found</div>
          ) : (
            filteredItems.map((item, index) => (
              <div
                key={item.id}
                className={`quick-search-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="quick-search-item-icon">{item.icon}</span>
                <div className="quick-search-item-info">
                  <div className="quick-search-item-label">{item.label}</div>
                  <div className="quick-search-item-category">{item.category}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="quick-search-footer">
          <span>↑↓ Navigate</span>
          <span>Enter Open</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  )
}

export default QuickSearch

