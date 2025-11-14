import './NotificationSystem.css'

function NotificationSystem({ notifications, onRemove }) {
  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
          onClick={() => onRemove(notification.id)}
        >
          <div className="notification-icon">
            {notification.type === 'success' && '✓'}
            {notification.type === 'error' && '✕'}
            {notification.type === 'warning' && '⚠'}
            {notification.type === 'info' && 'ℹ'}
          </div>
          <div className="notification-content">
            <div className="notification-message">{notification.message}</div>
            <div className="notification-time">
              {notification.timestamp.toLocaleTimeString()}
            </div>
          </div>
          <button className="notification-close" onClick={(e) => {
            e.stopPropagation()
            onRemove(notification.id)
          }}>×</button>
        </div>
      ))}
    </div>
  )
}

export default NotificationSystem

