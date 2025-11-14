import { useState, useRef, useEffect } from 'react'
import './Notepad.css'

function Notepad() {
  const [content, setContent] = useState('')
  const [fileName, setFileName] = useState('Untitled.txt')
  const [isSaved, setIsSaved] = useState(true)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  const handleContentChange = (e) => {
    setContent(e.target.value)
    setIsSaved(false)
  }

  const handleSave = () => {
    // Save to localStorage
    const files = JSON.parse(localStorage.getItem('notepadFiles') || '{}')
    files[fileName] = {
      content,
      modified: new Date().toISOString()
    }
    localStorage.setItem('notepadFiles', JSON.stringify(files))
    setIsSaved(true)
    alert(`File "${fileName}" saved!`)
  }

  const handleSaveAs = () => {
    const newName = prompt('Save as:', fileName)
    if (newName && newName.trim()) {
      setFileName(newName.trim())
      setTimeout(() => handleSave(), 100)
    }
  }

  const handleNew = () => {
    if (!isSaved && content.trim()) {
      if (!confirm('Unsaved changes will be lost. Continue?')) return
    }
    setContent('')
    setFileName('Untitled.txt')
    setIsSaved(true)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleOpen = () => {
    const files = JSON.parse(localStorage.getItem('notepadFiles') || '{}')
    const fileNames = Object.keys(files)
    
    if (fileNames.length === 0) {
      alert('No saved files found.')
      return
    }

    const selected = prompt(`Enter filename to open:\n${fileNames.join('\n')}`)
    if (selected && files[selected]) {
      setContent(files[selected].content)
      setFileName(selected)
      setIsSaved(true)
    } else if (selected) {
      alert('File not found.')
    }
  }

  return (
    <div className="notepad-container">
      <div className="notepad-toolbar">
        <button className="notepad-btn" onClick={handleNew}>📄 New</button>
        <button className="notepad-btn" onClick={handleOpen}>📂 Open</button>
        <button className="notepad-btn" onClick={handleSave}>💾 Save</button>
        <button className="notepad-btn" onClick={handleSaveAs}>💾 Save As</button>
        <div className="notepad-filename">
          {fileName} {!isSaved && '●'}
        </div>
      </div>
      <textarea
        ref={textareaRef}
        className="notepad-editor"
        value={content}
        onChange={handleContentChange}
        placeholder="Start typing..."
        spellCheck={false}
      />
      <div className="notepad-statusbar">
        <span>{content.length} characters</span>
        <span>{content.split('\n').length} lines</span>
      </div>
    </div>
  )
}

export default Notepad

