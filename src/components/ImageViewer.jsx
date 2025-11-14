import { useState } from 'react'
import './ImageViewer.css'

function ImageViewer({ imagePath }) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleReset = () => {
    setZoom(100)
    setRotation(0)
  }

  return (
    <div className="image-viewer-container">
      <div className="image-viewer-toolbar">
        <button className="image-viewer-btn" onClick={handleZoomOut}>🔍-</button>
        <span className="image-viewer-zoom">{zoom}%</span>
        <button className="image-viewer-btn" onClick={handleZoomIn}>🔍+</button>
        <button className="image-viewer-btn" onClick={handleRotate}>↻ Rotate</button>
        <button className="image-viewer-btn" onClick={handleReset}>↺ Reset</button>
        <div className="image-viewer-filename">
          {imagePath ? imagePath.split('/').pop() : 'No image'}
        </div>
      </div>
      <div className="image-viewer-content">
        {imagePath ? (
          <img
            src={imagePath}
            alt="Preview"
            className="image-viewer-img"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div className="image-viewer-placeholder" style={{ display: imagePath ? 'none' : 'flex' }}>
          <div>📷</div>
          <div>No image selected</div>
        </div>
      </div>
    </div>
  )
}

export default ImageViewer

