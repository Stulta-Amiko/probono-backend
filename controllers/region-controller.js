import { PrismaClient } from '@prisma/client'

import HttpError from '../../../backend/models/http-error.js'
import { validationResult } from 'express-validator'

const prisma = new PrismaClient()

const getRegionById = async(req, res, next) => {
    const regionId = parseInt(req.params.rid)
    const admin_id = req.userData.adminId

    let region

    try {
        region = await prisma.region.findUnique({ where: { id: regionId } })
    } catch (err) {
        const error = new HttpError('오류가 발생했습니다. 다시 시도해주세요.', 500)
        return next(error)
    }

    //허가된 사용자만 지역을 검색할 수 있도록 기능 구현 예정

    let isAccessible //접근여부 임시변수

    try {
        isAccessible = await prisma.authority.findMany({ where: { admin_id } })
    } catch (err) {
        const error = new HttpError('오류가 발생했습니다. 다시 시도해주세요', 500)
        return next(error)
    }

    /*
              if (isAccessible.admin_id !== req.userData.adminId) {
                  const error = new HttpError('허가되지 않은 접근입니다.', 403)
                  return next(error)
              } 프론트엔드 구현시 활성화*/

    if (!region) {
        const error = new HttpError(
            '지역을 찾을 수 없습니다. 다시 시도해주세요.',
            404
        )
        return next(error)
    }

    res.json({ region_name: region.name })
}

const getRegionByName = async(req, res, next) => {
    const regionName = req.params.rname
    const admin_id = req.userData.adminId

    let region

    try {
        region = await prisma.region.findMany({ where: { name: regionName } })
    } catch (err) {
        const error = new HttpError('오류가 발생했습니다. 다시 시도해주세요.', 500)
        return next(error)
    }

    //허가된 사용자만 지역을 검색할 수 있도록 기능 구현 예정

    let isAccessible //접근여부 임시변수

    try {
        isAccessible = await prisma.authority.findMany({ where: { admin_id } })
    } catch (err) {
        const error = new HttpError('오류가 발생했습니다. 다시 시도해주세요', 500)
        return next(error)
    }

    /*
              if (isAccessible.admin_id !== req.userData.adminId) {
                  const error = new HttpError('허가되지 않은 접근입니다.', 403)
                  return next(error)
              } 프론트엔드 구현시 활성화*/

    if (region.length === 0) {
        const error = new HttpError(
            '지역을 찾을 수 없습니다. 다시 시도해주세요.',
            404
        )
        return next(error)
    }
    res.json({ region_id: region[0].id, region_name: region[0].name })
}

const createRegion = async(req, res, next) => {
    const error = validationResult(req)
    const admin_id = req.userData.adminId

    if (!error.isEmpty()) {
        console.log(error)
        return next(
            new HttpError('유효하지 않은 정보가 입력되었습니다. 다시 시도해 주세요')
        )
    }

    const { name } = req.body

    //허가된 사용자만 지역을 추가할 수 있도록 기능 구현 예정

    let isAccessible //접근여부 임시변수

    try {
        isAccessible = await prisma.authority.findMany({ where: { admin_id } })
    } catch (err) {
        const error = new HttpError('오류가 발생했습니다. 다시 시도해주세요', 500)
        return next(error)
    }

    /*
              if (isAccessible.admin_id !== req.userData.adminId) {
                  const error = new HttpError('허가되지 않은 접근입니다.', 403)
                  return next(error)
              } 프론트엔드 구현시 활성화*/

    if (!isAccessible[0].is_admin &&
        !isAccessible[0].is_super &&
        isAccessible[0].is_user
    ) {
        const error = new HttpError('허가되지 않은 접근입니다.', 403)
        return next(error)
    }

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

const updateRegion = async(req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        console.log(errors)
        const error = new HttpError(
            '유효하지 않은 입력이 존재합니다. 다시 시도해주세요.',
            422
        )
        return next(error)
    }

    const { name } = req.body
    const regionId = parseInt(req.params.rid)

    let region

    try {
        region = await prisma.region.findUnique({ where: { id: regionId } })
    } catch (err) {
        const error = new HttpError('오류가 발생했습니다. 다시 시도해주세요.', 500)
        return next(error)
    }

    if (!region) {
        const error = new HttpError('존재하지 않는 지역입니다. 다시 시도해주세요.')
        return next(error)
    }

    //허가된 사용자만 업데이트 하도록 기능 구현 예정

    let isAccessible //접근여부 임시변수

    try {
        isAccessible = await prisma.authority.findMany({ where: { admin_id } })
    } catch (err) {
        const error = new HttpError('오류가 발생했습니다. 다시 시도해주세요', 500)
        return next(error)
    }

    /*
              if (isAccessible.admin_id !== req.userData.adminId) {
                  const error = new HttpError('허가되지 않은 접근입니다.', 403)
                  return next(error)
              } 프론트엔드 구현시 활성화*/

    if (!isAccessible[0].is_admin &&
        !isAccessible[0].is_super &&
        isAccessible[0].is_user
    ) {
        const error = new HttpError('허가되지 않은 접근입니다.', 403)
        return next(error)
    }

    try {
        region = await prisma.region.update({
            where: { id: regionId },
            data: { name },
        })
    } catch (err) {
        const error = new HttpError(
            '서버에 문제가 발생했습니다. 다시 시도해주세요.',
            500
        )
        return next(error)
    }

    res.status(200).json({ region: name })
}

const deleteRegion = async(req, res, next) => {
    const regionId = parseInt(req.params.rid)

    const admin_id = req.userData.adminId

    let region
    try {
        region = await prisma.region.findUnique({ where: { id: regionId } })
    } catch (err) {
        const error = new HttpError('오류가 발생했습니다. 다시 시도해주세요', 500)
        return next(error)
    }

    //허가된 사용자만 지역을 검색할 수 있도록 기능 구현 예정

    let isAccessible //접근여부 임시변수

    try {
        isAccessible = await prisma.authority.findMany({ where: { admin_id } })
    } catch (err) {
        const error = new HttpError('오류가 발생했습니다. 다시 시도해주세요', 500)
        return next(error)
    }

    /*
              if (isAccessible.admin_id !== req.userData.adminId) {
                  const error = new HttpError('허가되지 않은 접근입니다.', 403)
                  return next(error)
              } 프론트엔드 구현시 활성화*/

    if (!isAccessible[0].is_admin &&
        !isAccessible[0].is_super &&
        isAccessible[0].is_user
    ) {
        const error = new HttpError('허가되지 않은 접근입니다.', 403)
        return next(error)
    }

    if (!region) {
        const error = new HttpError(
            '지역을 찾을 수 없습니다. 다시 시도해주세요.',
            404
        )
        return next(error)
    }

    try {
        region = await prisma.region.delete({
            where: { id: regionId },
        })
    } catch (err) {
        const error = new HttpError(
            '지우는데 실패했습니다. 다시 시도해주세요.',
            500
        )
        return next(error)
    }

    res.status(200).json({ message: '삭제성공' })
}

export default {
    getRegionById,
    getRegionByName,
    createRegion,
    updateRegion,
    deleteRegion,
}