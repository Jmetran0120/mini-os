import './TopBar.css'

function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <img src="/logo.png" alt="Logo" className="top-bar-logo" />
        <div className="os-name">MINI OS</div>
      </div>
      <div className="top-bar-right">
        <span className="top-bar-hint">Press ⌘K or Ctrl+K to search</span>
      </div>
    </div>
  )
}

export default TopBar
