// taskModel.js - defines the shape of a task in MongoDB

import mongoose from 'mongoose'

// This is the structure of every task we save
const taskSchema = new mongoose.Schema({
  name:    { type: String, required: true },  // task title
  details: { type: String, default: '' },     // extra description
  time:    { type: String, default: '' },     // e.g. "10:00 AM"
  date:    { type: String, default: '' },     // e.g. "2026-06-05"
  status:  { type: String, default: 'pending' }, // pending or completed
}, {
  timestamps: true // auto adds createdAt and updatedAt
})

const Task = mongoose.model('Task', taskSchema)

export default Task