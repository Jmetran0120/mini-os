import { useState, useEffect } from 'react'
import './TaskScheduler.css'

function TaskScheduler({ showNotification }) {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('scheduledTasks')
    return saved ? JSON.parse(saved) : []
  })

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    repeat: 'once'
  })

  useEffect(() => {
    localStorage.setItem('scheduledTasks', JSON.stringify(tasks))
    
    // Check for due tasks
    const checkTasks = setInterval(() => {
      const now = new Date()
      tasks.forEach(task => {
        const taskDate = new Date(`${task.date}T${task.time}`)
        if (taskDate <= now && !task.completed && !task.notified) {
          showNotification(`Reminder: ${task.title}`, 'warning', 5000)
          setTasks(prev => prev.map(t => 
            t.id === task.id ? { ...t, notified: true } : t
          ))
        }
      })
    }, 60000) // Check every minute

    return () => clearInterval(checkTasks)
  }, [tasks, showNotification])

  const addTask = () => {
    if (!newTask.title.trim() || !newTask.date || !newTask.time) {
      alert('Please fill in all required fields')
      return
    }

    const task = {
      id: Date.now(),
      ...newTask,
      completed: false,
      notified: false,
      created: new Date().toISOString()
    }

    setTasks(prev => [...prev, task].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateA - dateB
    }))

    setNewTask({
      title: '',
      description: '',
      date: '',
      time: '',
      repeat: 'once'
    })

    showNotification('Task scheduled successfully!', 'success', 3000)
  }

  const toggleComplete = (id) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (id) => {
    if (confirm('Delete this task?')) {
      setTasks(prev => prev.filter(task => task.id !== id))
    }
  }

  const getTaskStatus = (task) => {
    const now = new Date()
    const taskDate = new Date(`${task.date}T${task.time}`)
    
    if (task.completed) return 'completed'
    if (taskDate < now) return 'overdue'
    if (taskDate <= new Date(now.getTime() + 3600000)) return 'due-soon'
    return 'upcoming'
  }

  const getStatusColor = (status) => {
    const colors = {
      completed: 'rgba(34, 197, 94, 0.3)',
      overdue: 'rgba(239, 68, 68, 0.3)',
      'due-soon': 'rgba(251, 146, 60, 0.3)',
      upcoming: 'rgba(99, 102, 241, 0.3)'
    }
    return colors[status] || colors.upcoming
  }

  return (
    <div className="task-scheduler-container">
      <div className="task-scheduler-header">
        <h2>Task Scheduler</h2>
        <p className="task-scheduler-description">Schedule reminders and tasks</p>
      </div>

      <div className="task-scheduler-content">
        <div className="task-scheduler-form">
          <h3>New Task</h3>
          <div className="task-form-group">
            <label>Title *</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Task title"
            />
          </div>
          <div className="task-form-group">
            <label>Description</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Task description"
              rows="3"
            />
          </div>
          <div className="task-form-row">
            <div className="task-form-group">
              <label>Date *</label>
              <input
                type="date"
                value={newTask.date}
                onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="task-form-group">
              <label>Time *</label>
              <input
                type="time"
                value={newTask.time}
                onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
              />
            </div>
          </div>
          <div className="task-form-group">
            <label>Repeat</label>
            <select
              value={newTask.repeat}
              onChange={(e) => setNewTask({ ...newTask, repeat: e.target.value })}
            >
              <option value="once">Once</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <button className="task-add-btn" onClick={addTask}>
            ➕ Add Task
          </button>
        </div>

        <div className="task-scheduler-list">
          <h3>Scheduled Tasks ({tasks.length})</h3>
          {tasks.length === 0 ? (
            <div className="task-empty">No tasks scheduled</div>
          ) : (
            <div className="task-list">
              {tasks.map(task => {
                const status = getTaskStatus(task)
                return (
                  <div
                    key={task.id}
                    className="task-item"
                    style={{ borderLeftColor: getStatusColor(status) }}
                  >
                    <div className="task-item-header">
                      <div className="task-item-checkbox">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleComplete(task.id)}
                        />
                        <span className={`task-item-title ${task.completed ? 'completed' : ''}`}>
                          {task.title}
                        </span>
                      </div>
                      <button
                        className="task-delete-btn"
                        onClick={() => deleteTask(task.id)}
                      >
                        🗑️
                      </button>
                    </div>
                    {task.description && (
                      <div className="task-item-description">{task.description}</div>
                    )}
                    <div className="task-item-footer">
                      <span className="task-item-datetime">
                        📅 {new Date(`${task.date}T${task.time}`).toLocaleString()}
                      </span>
                      <span className={`task-item-status status-${status}`}>
                        {status === 'completed' && '✓ Completed'}
                        {status === 'overdue' && '⚠ Overdue'}
                        {status === 'due-soon' && '⏰ Due Soon'}
                        {status === 'upcoming' && '📅 Upcoming'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskScheduler

