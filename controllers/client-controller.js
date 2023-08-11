import { PrismaClient } from '@prisma/client'
import { validationResult } from 'express-validator'

import HttpError from '../../../backend/models/http-error.js'

const prisma = new PrismaClient()

const getUserByRegionId = async(req, res, next) => {}

const getUserByAdminId = async(req, res, next) => {}

const getUserByName = async(req, res, next) => {}

const createUser = async(req, res, next) => {
    /*const errors = validationResult(req)

                if (!errors.isEmpty()) {
                    const error = new HttpError('유효하지 않은 정보가 입력되었습니다.')
                    return next(error)
                }*/

    const {
        region_id,
        admin_id,
        name,
        address,
        location,
        remark,
        birthdate,
        checkdate,
        phone_number,
    } = req.body

    let existingUser

    let PhoneNumber = parseInt(phone_number)

    try {
        existingUser = await prisma.client.findMany({
            where: { phone_number: PhoneNumber },
        })
    } catch (err) {
        console.log(err)
        const error = new HttpError('오류가 발생했습니다.', 500)
        return next(error)
    }

    if (existingUser.length !== 0) {
        const error = new HttpError('이미 추가된 회원입니다.', 422)
        return next(error)
    }

    let isValidRegion

    try {
        isValidRegion = await prisma.region.findUnique({ where: { id: region_id } })
    } catch (err) {
        const error = new HttpError(
            '유효하지 않은 지역을 고르셨습니다.1 서비스가 가능한 지역을 골라주세요',
            404
        )
        return next(error)
    }

    if (!isValidRegion) {
        const error = new HttpError(
            '유효하지 않은 지역을 고르셨습니다. 서비스가 가능한 지역을 골라주세요',
            422
        )
        return next(error)
    }

    try {
        await prisma.client.create({
            data: {
                admin_id,
                name,
                address,
                location,
                remark,
                birthdate,
                checkdate,
                phone_number: PhoneNumber,
                region_id,
            },
        })
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            '회원가입에 실패했습니다. 다시 시도해주세요. (프리즈마 데이터 입력 관련)',
            500
        )
        return next(error)
    }
    res.status(201).json({ message: 'user create!' })
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