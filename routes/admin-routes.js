import express from 'express'
import { check } from 'express-validator'

import checkAuth from '../middleware/check-auth.js'
import adminController from '../controllers/admin-controller.js'

const router = express.Router()

router.post(
    '/signup', [
        check('email').normalizeEmail().isEmail(),
        check('name').not().isEmpty(),
        check('password').isLength({ min: 6 }),
    ],
    adminController.signup
)
router.post('/login', adminController.login)

router.get('/', adminController.getAdmin)

router.get('/:aid', adminController.getAdminById)

router.get('/name/:aname', adminController.getAdminByName)

router.use(checkAuth)

router.post('/authority', adminController.adminAuthority)

router.patch('/:aid', adminController.updateAdmin)

router.patch('/update/authority', adminController.updateAdminAuthority)

router.delete('/:aid', adminController.deleteAdmin)

router.delete('/resign/authority', adminController.deleteAdminAuthority)

export default router