// taskModel.js - defines the shape of a task in MongoDB

import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  name:    { type: String, required: true },
  details: { type: String, default: '' },
  time:    { type: String, default: '' },
  date:    { type: String, default: '' },
  status:  { type: String, default: 'pending' },
}, {
  timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

export default Task