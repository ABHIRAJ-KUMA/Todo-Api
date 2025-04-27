const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  task: { type: String },
  description: { type: String },
  title: { type: String },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Todo', todoSchema);
