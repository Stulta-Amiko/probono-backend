import express from 'express'
import check from 'express-validator'

import regionController from '../controllers/region-controller.js'

const router = express.Router()

/*지역 관리 관련 라우터 */

router.get('/id/:rid', regionController.getRegionById)

router.get('/', regionController.getRegionByName)

router.post('/', regionController.createRegion) //TO-DO 지역 추가할때 Admin만 추가 가능하도록 막아두기

router.patch('/:rid', regionController.updateRegion)

router.delete('/:rid', regionController.deleteRegion)

export default router