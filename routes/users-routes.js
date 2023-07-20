import express from 'express'

const router = express.Router()

router.get('/') //유저 불러오기 작업 관리하는 유저들의 리스트 출력

router.post('/register') //일반적인 유저 등록하기

export default router