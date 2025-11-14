import './BootScreen.css'

function BootScreen() {
  return (
    <div className="boot-screen">
      <div className="boot-content">
        <img src="/logo.png" alt="Logo" className="boot-logo" />
        <div className="boot-loader"></div>
        <h1 className="boot-text">Booting MiniOS...</h1>
      </div>
    </div>
  )
}

export default BootScreen

