import { useState, useEffect, useRef } from 'react'
import './FileManager.css'

function FileManager() {
  const [fileSystem, setFileSystem] = useState(() => {
    const saved = localStorage.getItem('fileSystem')
    return saved ? JSON.parse(saved) : {
      '/': { items: [], created: new Date().toISOString() },
      '/Documents': { items: [], created: new Date().toISOString() },
      '/Downloads': { items: [], created: new Date().toISOString() },
      '/Desktop': { items: [], created: new Date().toISOString() },
      '/Applications': { items: [], created: new Date().toISOString() }
    }
  })
  
  const [currentPath, setCurrentPath] = useState('/')
  const [history, setHistory] = useState(['/'])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [selectedItems, setSelectedItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [contextMenu, setContextMenu] = useState(null)
  const contextMenuRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('fileSystem', JSON.stringify(fileSystem))
  }, [fileSystem])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navigateTo = (path) => {
    if (!fileSystem[path]) {
      setFileSystem(prev => ({
        ...prev,
        [path]: { items: [], created: new Date().toISOString() }
      }))
    }
    setCurrentPath(path)
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(path)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    setSelectedItems([])
  }

  const navigateBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setCurrentPath(history[newIndex])
      setSelectedItems([])
    }
  }

  const navigateForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setCurrentPath(history[newIndex])
      setSelectedItems([])
    }
  }

  const createFolder = () => {
    const name = prompt('New Folder Name:', 'Untitled Folder')
    if (!name || !name.trim()) return

    const currentFolder = fileSystem[currentPath]
    let folderName = name.trim()
    let counter = 1
    while (currentFolder.items.some(item => item.name === folderName)) {
      folderName = `${name.trim()} ${counter}`
      counter++
    }

    const newFolder = {
      name: folderName,
      type: 'folder',
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    }

    setFileSystem(prev => {
      const newSystem = { ...prev }
      newSystem[currentPath] = {
        ...newSystem[currentPath],
        items: [...(newSystem[currentPath].items || []), newFolder]
      }
      const folderPath = currentPath === '/' ? '/' + folderName : currentPath + '/' + folderName
      newSystem[folderPath] = { items: [], created: new Date().toISOString() }
      return newSystem
    })
  }

  const createFile = () => {
    const name = prompt('New File Name:', 'Untitled.txt')
    if (!name || !name.trim()) return

    const currentFolder = fileSystem[currentPath]
    let fileName = name.trim()
    let counter = 1
    while (currentFolder.items.some(item => item.name === fileName)) {
      const dotIndex = name.trim().lastIndexOf('.')
      if (dotIndex !== -1) {
        const base = name.trim().substring(0, dotIndex)
        const ext = name.trim().substring(dotIndex)
        fileName = `${base} ${counter}${ext}`
      } else {
        fileName = `${name.trim()} ${counter}`
      }
      counter++
    }

    const newFile = {
      name: fileName,
      type: 'file',
      content: '',
      size: '0 KB',
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    }

    setFileSystem(prev => ({
      ...prev,
      [currentPath]: {
        ...prev[currentPath],
        items: [...(prev[currentPath].items || []), newFile]
      }
    }))
  }

  const deleteSelected = () => {
    if (selectedItems.length === 0) return
    if (!confirm(`Move ${selectedItems.length} item(s) to Trash?`)) return

    setFileSystem(prev => {
      const newSystem = { ...prev }
      const currentFolder = { ...newSystem[currentPath] }
      const sortedIndices = [...selectedItems].sort((a, b) => b - a)
      
      sortedIndices.forEach(index => {
        const item = currentFolder.items[index]
        if (item) {
          if (item.type === 'folder') {
            const folderPath = currentPath === '/' ? '/' + item.name : currentPath + '/' + item.name
            delete newSystem[folderPath]
          }
          currentFolder.items.splice(index, 1)
        }
      })
      
      newSystem[currentPath] = currentFolder
      return newSystem
    })
    
    setSelectedItems([])
  }

  const openItem = (item) => {
    if (item.type === 'folder') {
      const newPath = currentPath === '/' ? '/' + item.name : currentPath + '/' + item.name
      navigateTo(newPath)
    } else {
      alert(`Opening file: ${item.name}`)
    }
  }

  const handleItemClick = (e, index) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedItems(prev => 
        prev.includes(index) 
          ? prev.filter(i => i !== index)
          : [...prev, index]
      )
    } else {
      setSelectedItems([index])
    }
  }

  const handleContextMenu = (e, item, index) => {
    e.preventDefault()
    setSelectedItems([index])
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      item,
      index
    })
  }

  const renameItem = () => {
    if (!contextMenu) return
    const { item, index } = contextMenu
    const newName = prompt('Rename:', item.name)
    if (!newName || !newName.trim() || newName === item.name) return

    const currentFolder = fileSystem[currentPath]
    if (currentFolder.items.some((it, i) => i !== index && it.name === newName.trim())) {
      alert('A file or folder with that name already exists.')
      return
    }

    setFileSystem(prev => {
      const newSystem = { ...prev }
      const currentFolder = { ...newSystem[currentPath] }
      const updatedItem = { ...currentFolder.items[index] }
      updatedItem.name = newName.trim()
      updatedItem.modified = new Date().toISOString()
      
      if (updatedItem.type === 'folder') {
        const oldPath = currentPath === '/' ? '/' + item.name : currentPath + '/' + item.name
        const newPath = currentPath === '/' ? '/' + newName.trim() : currentPath + '/' + newName.trim()
        if (newSystem[oldPath]) {
          newSystem[newPath] = newSystem[oldPath]
          delete newSystem[oldPath]
        }
      }
      
      currentFolder.items[index] = updatedItem
      newSystem[currentPath] = currentFolder
      return newSystem
    })
    
    setContextMenu(null)
  }

  const getPathParts = () => {
    return currentPath.split('/').filter(p => p)
  }

  const getFilteredItems = () => {
    const currentFolder = fileSystem[currentPath] || { items: [] }
    let items = currentFolder.items || []
    
    if (searchQuery) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return items.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1
      if (a.type !== 'folder' && b.type === 'folder') return 1
      return a.name.localeCompare(b.name)
    })
  }

  const items = getFilteredItems()

  return (
    <div className="file-manager">
      <div className="fm-toolbar">
        <button 
          className="fm-btn" 
          onClick={navigateBack}
          disabled={historyIndex === 0}
        >
          ◀ Back
        </button>
        <button 
          className="fm-btn" 
          onClick={navigateForward}
          disabled={historyIndex === history.length - 1}
        >
          Forward ▶
        </button>
        <div className="fm-divider"></div>
        <button className="fm-btn" onClick={createFolder}>📁 New Folder</button>
        <button className="fm-btn" onClick={createFile}>📄 New File</button>
        <button 
          className="fm-btn" 
          onClick={deleteSelected}
          disabled={selectedItems.length === 0}
        >
          🗑️ Delete
        </button>
        <div className="fm-divider"></div>
        <input
          type="text"
          className="fm-search"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="fm-path-bar">
        <span className="fm-path-item" onClick={() => navigateTo('/')}>
          🏠 Home
        </span>
        {getPathParts().map((part, index) => {
          const path = '/' + getPathParts().slice(0, index + 1).join('/')
          return (
            <span
              key={path}
              className="fm-path-item"
              onClick={() => navigateTo(path)}
            >
              {part}
            </span>
          )
        })}
      </div>

      <div className="fm-file-area">
        {items.length === 0 ? (
          <div className="fm-empty-state">
            <div className="fm-empty-icon">📁</div>
            <div className="fm-empty-text">This folder is empty</div>
          </div>
        ) : (
          <div className="fm-grid">
            {items.map((item, index) => (
              <div
                key={index}
                className={`file-item ${selectedItems.includes(index) ? 'selected' : ''}`}
                onClick={(e) => handleItemClick(e, index)}
                onDoubleClick={() => openItem(item)}
                onContextMenu={(e) => handleContextMenu(e, item, index)}
              >
                <div className="file-icon">
                  {item.type === 'folder' ? '📁' : '📄'}
                </div>
                <div className="file-name">{item.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fm-statusbar">
        <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
        {selectedItems.length > 0 && (
          <span>{selectedItems.length} selected</span>
        )}
      </div>

      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fm-context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div className="fm-context-item" onClick={createFolder}>📁 New Folder</div>
          <div className="fm-context-item" onClick={createFile}>📄 New File</div>
          <div className="fm-context-divider"></div>
          <div className="fm-context-item" onClick={renameItem}>✏️ Rename</div>
          <div className="fm-context-divider"></div>
          <div className="fm-context-item" onClick={deleteSelected}>🗑️ Delete</div>
        </div>
      )}
    </div>
  )
}

export default FileManager

