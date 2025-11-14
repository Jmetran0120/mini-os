import { useState, useRef } from 'react'

function MusicPlayer() {
  const [track, setTrack] = useState('assets/music/Lovin on Me.mp3')
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const audioRef = useRef(null)

  const tracks = [
    { value: 'assets/music/Lovin on Me.mp3', label: 'Jack Harlow - Lovin on Me' },
    { value: 'assets/music/ISIS.mp3', label: 'Joyner Lucas - Isis' },
    { value: 'assets/music/DYLHITM.mp3', label: 'Niki - Do you like her in the morning' },
    { value: 'assets/music/Moon River.mp3', label: 'Frank Ocean - Moon River' }
  ]

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleTrackChange = (e) => {
    const newTrack = e.target.value
    setTrack(newTrack)
    if (audioRef.current) {
      audioRef.current.src = newTrack
      if (isPlaying) {
        audioRef.current.play()
      }
    }
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <audio ref={audioRef} src={track} volume={volume} />
      <select
        value={track}
        onChange={handleTrackChange}
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          color: 'white',
          fontFamily: 'inherit'
        }}
      >
        {tracks.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          style={{
            padding: '10px 20px',
            margin: '0 10px',
            background: 'rgba(99, 102, 241, 0.3)',
            border: '1px solid rgba(99, 102, 241, 0.5)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </button>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '10px' }}>Volume: </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => {
            const newVolume = parseFloat(e.target.value)
            setVolume(newVolume)
            if (audioRef.current) {
              audioRef.current.volume = newVolume
            }
          }}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  )
}

export default MusicPlayer

