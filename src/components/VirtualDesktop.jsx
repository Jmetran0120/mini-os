import { useState } from 'react'
import './VirtualDesktop.css'

function VirtualDesktop({ currentWorkspace, onSwitchWorkspace, workspaces }) {
  return (
    <div className="virtual-desktop-container">
      <div className="virtual-desktop-header">
        <h2>Virtual Desktops</h2>
        <p className="virtual-desktop-description">Manage multiple desktop workspaces</p>
      </div>

      <div className="virtual-desktop-content">
        <div className="workspace-grid">
          {workspaces.map((workspace, index) => (
            <div
              key={index}
              className={`workspace-card ${currentWorkspace === index ? 'active' : ''}`}
              onClick={() => onSwitchWorkspace(index)}
            >
              <div className="workspace-number">Desktop {index + 1}</div>
              <div className="workspace-preview">
                {workspace.windows?.length > 0 ? (
                  <div className="workspace-windows">
                    {workspace.windows.slice(0, 4).map((win, i) => (
                      <div key={i} className="workspace-window-preview">
                        {win.icon}
                      </div>
                    ))}
                    {workspace.windows.length > 4 && (
                      <div className="workspace-window-preview more">
                        +{workspace.windows.length - 4}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="workspace-empty">Empty</div>
                )}
              </div>
              {currentWorkspace === index && (
                <div className="workspace-active-indicator">● Active</div>
              )}
            </div>
          ))}
        </div>

        <div className="workspace-shortcuts">
          <h3>Keyboard Shortcuts</h3>
          <div className="shortcut-list">
            <div className="shortcut-item">
              <span className="shortcut-keys">Ctrl + 1-4</span>
              <span className="shortcut-desc">Switch to desktop</span>
            </div>
            <div className="shortcut-item">
              <span className="shortcut-keys">Ctrl + ←</span>
              <span className="shortcut-desc">Previous desktop</span>
            </div>
            <div className="shortcut-item">
              <span className="shortcut-keys">Ctrl + →</span>
              <span className="shortcut-desc">Next desktop</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VirtualDesktop

