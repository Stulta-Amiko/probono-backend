import express from 'express'
import { check } from 'express-validator'

import adminController from '../controllers/admin-controller.js'

const router = express.Router()

router.get('/:aid', adminController.getAdminById)

router.post(
    '/signup', [
        check('email').normalizeEmail().isEmail(),
        check('name').not().isEmpty(),
        check('password').isLength({ min: 6 }),
    ],
    adminController.signup
)
router.post('/login', adminController.login)

export default router