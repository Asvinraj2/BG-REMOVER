import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './configs/mongodb.js'
import userRouter from './routes/userRoutes.js'
import imageRouter from './routes/imageRoutes.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = process.env.PORT || 4000
const app = express()

// Create uploads directory if it doesn't exist
const uploadsDir = join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

// Initialize middlewares
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(cors())

app.use(cors({
    origin: 'https://bg-remover-zeta.vercel.app', // Allow only your deployed frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
    credentials: true // If you're using cookies for authentication
  }))

// Serve uploads directory
app.use('/uploads', express.static(uploadsDir))

// Connect to database and start server
try {
    await connectDB()
    
    app.get('/', (req, res) => res.send("API Working"))
    app.use('/api/user', userRouter)
    app.use('/api/image', imageRouter)
    
    // Global error handler
    app.use((err, req, res, next) => {
        console.error('Error:', err)
        res.status(err.status || 500).json({
            success: false,
            message: err.message || 'Internal server error'
        })
    })
    
    app.listen(PORT, () => console.log("Server Running on port " + PORT))
} catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
}