import { PrismaClient } from '@prisma/client'
import { validationResult } from 'express-validator'

import HttpError from '../../../backend/models/http-error.js'

const prisma = new PrismaClient()

const getUserByRegionId = async(req, res, next) => {}

const getUserByAdminId = async(req, res, next) => {
    let user
    let adminId = parseInt(req.params.aid)

    try {
        user = await prisma.client.findMany({
                where: { admin_id: adminId },
            }) //비밀번호 빼고전송
    } catch (err) {
        console.log(err)
        const error = new HttpError('Fetching users failed, Please try again later')
        return next(error)
    }
    res.json({
        users: user.map((user) => user),
    })
}

const getUserByName = async(req, res, next) => {}

const createUser = async(req, res, next) => {
    /*const errors = validationResult(req)

                                                                if (!errors.isEmpty()) {
                                                                    const error = new HttpError('유효하지 않은 정보가 입력되었습니다.')
                                                                    return next(error)
                                                                }*/

    const { region_id, name, address, birthdate, phone_number } = req.body

    let existingUser

    let PhoneNumber = parseInt(phone_number)
    let isAccessible
    let superuser = req.userData.adminId

    try {
        isAccessible = await prisma.authority.findMany({
            where: { admin_id: superuser },
        })
    } catch (err) {
        const error = new HttpError('오류가 발생했습니다. 다시 시도해주세요', 500)
        return next(error)
    }

    console.log(req.userData.adminId)

    if (!isAccessible[0].is_super) {
        const error = new HttpError('허가되지 않은 접근입니다.', 403)
        return next(error)
    }

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
                admin_id: req.userData.adminId,
                name,
                address,
                location: '좌표 더미, 추후 수정',
                remark: '특이사항 초기 생성시 문구',
                birthdate,
                checkdate: '2023-01-01T13:49:50Z',
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