import { PrismaClient } from '@prisma/client'
import { validationResult } from 'express-validator'

import HttpError from '../../../backend/models/http-error.js'

const prisma = new PrismaClient()

const getUserByRegionId = async(req, res, next) => {}

const getUserByAdminId = async(req, res, next) => {}

const getUserByName = async(req, res, next) => {}

const createUser = async(req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const error = new HttpError('유효하지 않은 정보가 입력되었습니다.')
        return next(error)
    }

    const {
        region_id,
        admin_id,
        name,
        address,
        location,
        remark,
        birthdate,
        checkdate,
        phoneNumber,
    } = req.body

    let existingUser

    try {
        existingUser = await prisma.client.findMany({
            where: { phone_number: phoneNumber },
        })
    } catch (err) {
        const error = new HttpError()
        return next(error)
    }
}

const updateUser = async(req, res, next) => {}

const deleteUser = async(req, res, next) => {}

const addToCsvClient = async(req, res, next) => {}

const getFortune = async(req, res, next) => {} //구현후 util로 빠질예정

export default {
    getUserByName,
    getUserByAdminId,
    getUserByRegionId,
    createUser,
    updateUser,
    deleteUser,
    addToCsvClient,
    getFortune,
}