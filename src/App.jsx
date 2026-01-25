import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL =
  import.meta.env.VITE_API_BASE || 'https://todo-back-production-a40d.up.railway.app'

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const stats = useMemo(() => {
    const total = todos.length
    const completed = todos.filter((todo) => todo.completed).length
    return { total, completed }
  }, [todos])

  const fetchTodos = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/todos`)
      const data = await response.json()
      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Failed to load todos')
      }
      setTodos(Array.isArray(data.items) ? data.items : [])
    } catch (err) {
      setError(err.message || 'Failed to load todos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  const handleAdd = async (event) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed, completed: false }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Failed to add todo')
      }
      setTitle('')
      await fetchTodos()
    } catch (err) {
      setError(err.message || 'Failed to add todo')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (todo) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/todos/${todo._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Failed to update todo')
      }
      setTodos((prev) =>
        prev.map((item) => (item._id === todo._id ? data.item : item))
      )
    } catch (err) {
      setError(err.message || 'Failed to update todo')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (todoId) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/todos/${todoId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Failed to delete todo')
      }
      setTodos((prev) => prev.filter((item) => item._id !== todoId))
    } catch (err) {
      setError(err.message || 'Failed to delete todo')
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (todo) => {
    setEditingId(todo._id)
    setEditingTitle(todo.title)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingTitle('')
  }

  const handleEditSave = async (todoId) => {
    const trimmed = editingTitle.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/todos/${todoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Failed to update todo')
      }
      setTodos((prev) =>
        prev.map((item) => (item._id === todoId ? data.item : item))
      )
      cancelEditing()
    } catch (err) {
      setError(err.message || 'Failed to update todo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>Todo App</h1>
        <p className="app__meta">
          {stats.completed}/{stats.total} completed
        </p>
      </header>

      <form className="todo-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Add a new task..."
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !title.trim()}>
          Add
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      <section className="todo-list">
        {loading && todos.length === 0 ? (
          <p className="empty">Loading...</p>
        ) : todos.length === 0 ? (
          <p className="empty">No todos yet.</p>
        ) : (
          todos.map((todo) => (
            <div className="todo-item" key={todo._id}>
              <label className="todo-item__main">
                <input
                  type="checkbox"
                  checked={Boolean(todo.completed)}
                  onChange={() => handleToggle(todo)}
                  disabled={loading}
                />
                {editingId === todo._id ? (
                  <input
                    className="todo-item__edit"
                    type="text"
                    value={editingTitle}
                    onChange={(event) => setEditingTitle(event.target.value)}
                    disabled={loading}
                  />
                ) : (
                  <span
                    className={
                      todo.completed ? 'todo-title is-completed' : 'todo-title'
                    }
                  >
                    {todo.title}
                  </span>
                )}
              </label>

              <div className="todo-item__actions">
                {editingId === todo._id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleEditSave(todo._id)}
                      disabled={loading || !editingTitle.trim()}
                    >
                      Save
                    </button>
                    <button type="button" onClick={cancelEditing} disabled={loading}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => startEditing(todo)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(todo._id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  )
}

export default App
