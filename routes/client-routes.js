import express from 'express'

import clientController from '../controllers/client-controller.js'

const router = express.Router()

router.get('/rid/:rid', clientController.getUserByRegionId)

router.get('/aid/:aid', clientController.getUserByAdminId)

router.get('/cname/:name', clientController.getUserByName)

router.post('/', clientController.createUser) //일반적인 유저 등록하기

router.patch('/:cid')

router.delete('/:cid', clientController.deleteUser)

//router.post('/bulk-to-csv',clientController.addToCsvClient) csv를 이용한 데이터 등록

//router.get('/fortune',clientController.getFortune) 운세 APi 가져오는 작업

export default router