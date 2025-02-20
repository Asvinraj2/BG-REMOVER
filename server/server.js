import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './configs/mongodb.js'
import userRouter from './routes/userRoutes.js'

const PORT = process.env.PORT || 4000
const app = express()

// Initialize middlewares
app.use(express.json({ limit: '10mb' }))  // Added limit for larger payloads
app.use(cors())

// Connect to database before starting server
try {
    await connectDB()
    
    // API routes
    app.get('/', (req, res) => res.send("API Working"))
    app.use('/api/user', userRouter)
    
    app.listen(PORT, () => console.log("Server Running on PORT " + PORT))
} catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
}




// import 'dotenv/config'
// import express from 'express'
// import cors from 'cors'
// import connectDB from './configs/mongodb.js'
// import userRouter from './routes/userRoutes.js'


// // App Config

// const PORT = process.env.PORT || 4000
// const app = express()
// await connectDB()

// //initialize middlewares
// app.use(express.json())
// app.use(cors())

// //API route
// app.get('/', (req,res) => res.send("API Working"))
// app.use('/api/user', userRouter)

// app.listen(PORT, () => console.log("Server Running on PORT "+PORT))