import express from 'express'
import { check } from 'express-validator'

const router = express.Router()

router.get('/')

router.post('/signup')
router.post('/login')

export default router