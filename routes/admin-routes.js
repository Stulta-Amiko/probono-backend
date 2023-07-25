import express from 'express'
import { check } from 'express-validator'

const router = express.Router()

router.get('/')

router.post('/signup', [
    check('email').normalizeEmail().isEmail(),
    check('name').not().isEmpty(),
    check('password').isLength({ min: 6 }),
])
router.post('/login')

export default router