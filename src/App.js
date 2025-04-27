import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dueDate, setDueDate] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api';

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/todos`);
      const formatted = data.map(todo => ({
        ...todo,
        createdAt: formatDate(todo.createdAt),
        dueDate: formatDate(todo.dueDate)
      }));
      setTodos(formatted);
    } catch (err) {
      setError(err.message || 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async () => {
    if (!task.trim()) return;
    try {
      const todoData = {
        task: task.trim(),
        completed: false
      };
      if (dueDate) {
        todoData.dueDate = new Date(dueDate).toISOString();
      }
      const { data } = await axios.post(`${API_BASE_URL}/todos`, todoData);
      setTodos([...todos, {
        ...data,
        createdAt: formatDate(data.createdAt),
        dueDate: formatDate(data.dueDate)
      }]);
      setTask('');
      setDueDate('');
    } catch (err) {
      setError(err.message || 'Failed to add todo');
    }
  };

  const toggleTodo = async (id) => {
    try {
      const todo = todos.find(t => t._id === id);
      const { data } = await axios.patch(`${API_BASE_URL}/todos/${id}`, {
        completed: !todo.completed
      });
      setTodos(todos.map(t => t._id === id ? {
        ...data,
        createdAt: formatDate(data.createdAt),
        dueDate: formatDate(data.dueDate)
      } : t));
    } catch (err) {
      setError(err.message || 'Failed to update todo');
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/todos/${id}`);
      setTodos(todos.filter(t => t._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete todo');
    }
  };

  const insertStoreData = async () => {
    try {
      await axios.post(`${API_BASE_URL}/todos/bulk`, [
        {
          title: "Store A",
          month: "06-2024",
          description: "Total Revenue: 230.00",
          AveragePrice: "15.00"
        },
        {
          title: "Store B",
          month: "06-2024",
          description: "Total Revenue: 150.00",
          AveragePrice: "12.05"
        }
      ]);
      fetchTodos();
    } catch (err) {
      setError(err.message || 'Failed to insert store todos');
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'pending') return !todo.completed;
    return true;
  });

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo-container">
          
          <h1>Create Todo List</h1>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="add-todo">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Task description"
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          disabled={loading}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
        <button onClick={addTodo} disabled={loading || !task.trim()}>
          {loading ? 'Adding...' : 'Add Todo'}
        </button>
        <button onClick={insertStoreData} disabled={loading}>
          Insert Store Todos
        </button>
      </div>

      <div className="filters">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All</button>
        <button onClick={() => setFilter('completed')} className={filter === 'completed' ? 'active' : ''}>Completed</button>
        <button onClick={() => setFilter('pending')} className={filter === 'pending' ? 'active' : ''}>Pending</button>
      </div>

      {loading ? (
        <div className="loading">Loading todos...</div>
      ) : (
        <ul className="todo-list">
          {filteredTodos.map(todo => (
            <li key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <div className="todo-content">
                <span onClick={() => toggleTodo(todo._id)}>
                  {todo.task || todo.title}
                </span>
                <div className="todo-meta">
                  {todo.description && <p>{todo.description}</p>}
                  <span className="todo-date">Created: {todo.createdAt}</span>
                  {todo.dueDate && (
                    <span className={`todo-date ${new Date(todo.dueDate) < new Date() && !todo.completed ? 'overdue' : ''}`}>
                      Due: {todo.dueDate}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => deleteTodo(todo._id)} className="delete-btn" disabled={loading}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;