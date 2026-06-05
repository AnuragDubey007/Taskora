// db.js - connects our app to MongoDB

import mongoose from 'mongoose'

// This function connects to MongoDB
// We call it once when server starts
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message)
    process.exit(1) // stop the server if DB fails
  }
}

export default connectDB