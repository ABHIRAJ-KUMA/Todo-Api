const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Create an express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for all origins (for development)
app.use(cors());

// MongoDB connection URI
const dbURI = 'mongodb://localhost:27017/todosApp'; // Replace this with your Mongo URI

// Connect to MongoDB
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Failed to connect to MongoDB', err));

// Todo model schema
const todoSchema = new mongoose.Schema({
  title: String,
  description: String,
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  dueDate: { type: Date }
});

const Todo = mongoose.model('Todo', todoSchema);

// Route to fetch all todos
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.status(200).json(todos);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch todos' });
  }
});

// Route to create a new todo
app.post('/api/todos', async (req, res) => {
  const { task, completed, dueDate } = req.body;
  try {
    const newTodo = new Todo({
      title: task,
      description: `Total Revenue: ${task}`, // Placeholder, you can customize this
      completed,
      dueDate
    });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add todo' });
  }
});

// Route to update a todo (mark as completed)
app.patch('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    const updatedTodo = await Todo.findByIdAndUpdate(id, { completed }, { new: true });
    res.status(200).json(updatedTodo);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update todo' });
  }
});

// Route to delete a todo
app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Todo.findByIdAndDelete(id);
    res.status(200).json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete todo' });
  }
});

// Bulk insert route for store todos
app.post('/api/todos/bulk', async (req, res) => {
  try {
    const storeTodos = req.body; // Array of store data to insert
    await Todo.insertMany(storeTodos);
    res.status(201).json({ message: 'Todos inserted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to insert store todos' });
  }
});

// Set up the server to listen on port 5000
const port = 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
