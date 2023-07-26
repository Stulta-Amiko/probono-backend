import express from 'express'

const router = express.Router()

router.get('/')

router.post('/reqNoti') //admin 측에서 알림을 전송하는

router.post('/resNoti') //client 측에서 알림확인 여부를 전송하는

export default router