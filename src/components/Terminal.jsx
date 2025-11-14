import { useState, useRef, useEffect } from 'react'

function Terminal() {
  const [history, setHistory] = useState(['Mini OS Terminal v1.0', 'Type "help" for available commands.', ''])
  const [input, setInput] = useState('')
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef(null)
  const outputRef = useRef(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [history])

  const executeCommand = (cmd) => {
    const parts = cmd.split(' ')
    const command = parts[0].toLowerCase()
    const args = parts.slice(1)

    switch (command) {
      case 'help':
        return [
          'Available commands:',
          '  echo <text>     - Display text',
          '  clear           - Clear terminal screen',
          '  help            - Show this help message',
          '  date            - Show current date and time',
          '  whoami          - Show current user',
          '  exit            - Close terminal'
        ]
      case 'clear':
        setHistory([])
        return []
      case 'echo':
        return [args.join(' ')]
      case 'date':
        return [new Date().toString()]
      case 'whoami':
        return ['user']
      default:
        return [`Command not found: ${command}. Type "help" for available commands.`]
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const newHistory = [...history, `user@minios:~$ ${input}`]
    const output = executeCommand(input)
    setHistory([...newHistory, ...output, ''])
    setInput('')
    setHistoryIndex(-1)
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(0, 0, 0, 0.4)',
      padding: '20px',
      fontFamily: 'monospace'
    }}>
      <div
        ref={outputRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          color: 'rgba(0, 255, 136, 0.9)',
          marginBottom: '10px',
          fontSize: '13px'
        }}
      >
        {history.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'rgba(99, 102, 241, 0.9)' }}>user@minios:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'rgba(0, 255, 136, 0.9)',
              outline: 'none',
              fontFamily: 'monospace',
              fontSize: '13px'
            }}
            autoFocus
          />
        </div>
      </form>
    </div>
  )
}

export default Terminal

