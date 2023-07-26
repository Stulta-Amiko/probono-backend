import { PrismaClient } from '@prisma/client'

import HttpError from '../../../backend/models/http-error.js'
import { validationResult } from 'express-validator'

const getRegionById = async(req, res, next) => {}

const getRegionByName = async(req, res, next) => {}

const createRegion = async(req, res, next) => {
    const error = validationResult(req)

    if (!error.isEmpty()) {
        console.log(error)
        return next(
            new HttpError('유효하지 않은 정보가 입력되었습니다. 다시 시도해 주세요')
        )
    }

    const { name } = req.body

    const prisma = new PrismaClient()

    try {
        await prisma.region.create({
            data: {
                name: name,
            },
        })
    } catch (err) {
        const error = new HttpError(
            '지역 추가에 실패했습니다. 다시 시도해 주세요',
            500
        )
        return next(error)
    }

    res.status(201).json({ region: name })
}

const updateRegion = async(req, res, next) => {}

const deleteRegion = async(req, res, next) => {}

export default {
    getRegionById,
    getRegionByName,
    createRegion,
    updateRegion,
    deleteRegion,
}