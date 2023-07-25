import express from 'express'

const router = express.Router()

router.get('/') //유저 불러오기 작업 관리하는 유저들의 리스트 출력

router.post('/register') //일반적인 유저 등록하기

//router.post('/bulk-to-csv') csv를 이용한 데이터 등록

export default router