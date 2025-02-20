import express from 'express'
import { clerkWebhooks } from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.post('/webhooks', express.raw({ type: 'application/json' }), clerkWebhooks)

export default userRouter