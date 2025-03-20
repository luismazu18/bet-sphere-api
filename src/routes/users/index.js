import express from 'express'
import { authStack } from '../../middleware/index.js'
import registryUser from './registry-user.js'

const router = express.Router({ mergeParams: true })

router.post('/register', authStack, registryUser)

export default router
