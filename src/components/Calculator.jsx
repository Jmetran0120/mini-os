import { useState } from 'react'

function Calculator() {
  const [display, setDisplay] = useState('')
  const [result, setResult] = useState('')

  const handleClick = (value) => {
    if (value === 'C') {
      setDisplay('')
      setResult('')
    } else if (value === '=') {
      try {
        const evalResult = eval(display)
        setResult(evalResult.toString())
        setDisplay(evalResult.toString())
      } catch {
        setResult('Error')
      }
    } else {
      setDisplay(prev => prev + value)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '300px' }}>
      <input
        type="text"
        value={display || result}
        readOnly
        style={{
          width: '100%',
          padding: '15px',
          fontSize: '24px',
          marginBottom: '10px',
          textAlign: 'right',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          color: 'white',
          fontFamily: 'inherit'
        }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {['C', '7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '+', '='].map(btn => (
          <button
            key={btn}
            onClick={() => handleClick(btn)}
            style={{
              padding: '15px',
              fontSize: '18px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Calculator

