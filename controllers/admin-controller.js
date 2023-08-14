import { validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

import HttpError from '../../../backend/models/http-error.js'

dotenv.config()
const JWTKEY = process.env.TOKEN_KEY
const prisma = new PrismaClient()

const getAdmin = async(req, res, next) => {
    let user
    try {
        user = await prisma.admin.findMany({ select: { name: true } }) //비밀번호 빼고전송
    } catch (err) {
        const error = new HttpError('Fetching users failed, Please try again later')
        return next(error)
    }
    res.json({
        admins: user.map((admin) => admin.name),
    })
}

const getAdminByName = async(req, res, next) => {
    const name = req.params.aname
    let user
    try {
        user = await prisma.admin.findMany({ where: { name } }) //비밀번호 빼고전송
    } catch (err) {
        const error = new HttpError('Fetching users failed, Please try again later')
        return next(error)
    }
    res.json({
        adminId: user[0].id,
    })
}

const getAdminById = async(req, res, next) => {
    const adminId = parseInt(req.params.aid)

    let user

    try {
        user = await prisma.admin.findUnique({ where: { id: adminId } })
    } catch (err) {
        const error = new HttpError('오류가 발생했습니다. 다시 시도해주세요.', 500)
        return next(error)
    }

    if (!user) {
        const error = new HttpError('관리자를 찾을 수 없습니다.', 404)
        return next(error)
    }

    res.json({ adminName: user.name })
}

const signup = async(req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new HttpError('유효하지 않은 정보가 입력되었습니다.', 422)
        return next(error)
    }

    const { name, email, password, region_id } = req.body

    let existingUser

    try {
        existingUser = await prisma.admin.findMany({ where: { email: email } })
    } catch (err) {
        const error = new HttpError('회원가입에 실패했습니다. (초기오류)', 500)
        return next(error)
    }

    if (existingUser.length !== 0) {
        const error = new HttpError(
            '이미 회원가입 된 회원입니다. 로그인 해주세요.',
            422
        )
        return next(error)
    }

    //TO-DO가입시 유효한 리전에 접근하는지 검사하는 코드 작성
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

    console.log(!!isValidRegion)

    if (!isValidRegion) {
        const error = new HttpError(
            '유효하지 않은 지역을 고르셨습니다. 서비스가 가능한 지역을 골라주세요',
            422
        )
        return next(error)
    }

    let hashedPassword

    try {
        hashedPassword = await bcrypt.hash(password, 12)
    } catch (err) {
        const error = new HttpError(
            '회원가입에 실패했습니다. 다시 시도해주세요. (bcrypt 패키지 관련)',
            422
        )
        return next(error)
    }

    try {
        await prisma.admin.create({
            data: {
                email,
                name,
                password: hashedPassword,
                region_id,
            },
        })
    } catch (err) {
        const error = new HttpError(
            '회원가입에 실패했습니다. 다시 시도해주세요. (프리즈마 데이터 입력 관련)',
            500
        )
        return next(error)
    }

    let token

    const user = await prisma.admin.findMany({
        where: {
            email: email,
        },
    })

    try {
        token = jwt.sign({ adminId: user[0].id, email: user[0].email }, JWTKEY, {
            expiresIn: '1h',
        })
    } catch (err) {
        const error = new HttpError(
            '회원가입에 실패했습니다. 다시 시도해주세요.(토큰관련)',
            500
        )
        return next(error)
    }
    res
        .status(201)
        .json({ adminId: user[0].id, email: user[0].email, token: token }) //로그인 성공시 유저 정보 및 토큰 전송
}

const login = async(req, res, next) => {
    const { email, password } = req.body

    let existingUser

    try {
        //존재하는 유저일 경우 existiongUser에 대조후 맞는값 찾아서 반환
        existingUser = await prisma.admin.findMany({ where: { email: email } })
    } catch (err) {
        const error = new HttpError('로그인에 실패했습니다. 다시 시도해주세요', 500)
        return next(error)
    }

    if (!existingUser[0]) {
        const error = new HttpError('유효하지 않은 정보가 입력되었습니다.', 403)
        return next(error)
    }

    let isValidPassword = false

    try {
        isValidPassword = await bcrypt.compare(password, existingUser[0].password) // bcrypt 이용해서 암호화된 비밀번호와 입력된 비밀번호 일치하는지 여부 판단
    } catch (err) {
        const error = new HttpError(
            '로그인에 실패했습니다. 입력된 정보를 다시한번 확인해주세요',
            500
        )
        return next(error)
    }

    if (!isValidPassword) {
        const error = new HttpError('로그인에 실패했습니다. 다시 시도해주세요', 500)
        return next(error)
    }

    let token
    try {
        //jwt 통해서 로그인된 유저의 정보 전송 및 토큰 제한시간 설정 1시간 예정
        token = jwt.sign({ adminId: existingUser[0].id, email: existingUser[0].email },
            JWTKEY, {
                expiresIn: '1h',
            }
        )
    } catch (err) {
        const error = new HttpError(
            '회원가입에 실패했습니다. 다시 시도해주세요.(토큰관련)',
            500
        )
        return next(error)
    }

    res.status(201).json({
            adminId: existingUser[0].id,
            email: existingUser[0].email,
            token: token,
        }) //로그인 성공시 유저 정보 및 토큰 전송유저 아이디, 이메일, 토큰 전송
}

const adminAuthority = async(req, res, next) => {
    const { is_super, is_admin, is_user, admin_id } = req.body

    let existingUser
    let duplication

    try {
        existingUser = await prisma.admin.findUnique({ where: { id: admin_id } })
    } catch (err) {
        console.log(err)
        const error = new HttpError('오류가 발생했습니다. 다시 시도해주세요.', 500)
        return next(error)
    }

    if (!existingUser) {
        const error = new HttpError('존재하지 않는 회원입니다.', 404)
        return next(error)
    }

    try {
        duplication = await prisma.authority.findMany({ where: { admin_id } })
    } catch (err) {
        const error = new HttpError('오류가 발생했습니다. 다시 시도해주세요', 500)
        return next(error)
    }

    console.log(!!duplication[0])

    if (duplication[0]) {
        const error = new HttpError('이미 권한 설정이 되어있는 사용자입니다.', 422)
        return next(error)
    }

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

    if (!isAccessible[0].is_super) {
        const error = new HttpError('허가되지 않은 접근입니다.', 403)
        return next(error)
    }

    try {
        await prisma.authority.create({
            data: {
                is_super,
                is_admin,
                is_user,
                admin_id,
            },
        })
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            '권한생성에 실패했습니다. 다시 시도해주세요.',
            500
        )
        return next(error)
    }

    res.status(201).json({ message: 'create authority' })
}

const updateAdminAuthority = async(req, res, next) => {
    const { is_super, is_admin, is_user, admin_id } = req.body

    let existingUser

    try {
        existingUser = await prisma.authority.findMany({ where: { admin_id } })
    } catch (err) {
        const error = new HttpError('오류가 발생했습니다. 다시 시도해주세요.', 500)
        return next(error)
    }

    if (!existingUser[0]) {
        const error = new HttpError(
            '권한이 등록되지 않은 회원입니다. 권한을 먼저 등록해주세요',
            404
        )
        return next(error)
    }

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

    if (!isAccessible[0].is_super) {
        const error = new HttpError('허가되지 않은 접근입니다.', 403)
        return next(error)
    }

    const update_id = existingUser[0].id

    try {
        await prisma.authority.update({
            where: { id: update_id },
            data: {
                is_super,
                is_admin,
                is_user,
            },
        })
    } catch (err) {
        console.log(err)
        const error = new HttpError('수정에 실패했습니다. 다시 시도해주세요.', 500)
        return next(error)
    }

    res.status(200).json({ message: '권한이 수정되었습니다.' })
}

const deleteAdminAuthority = async(req, res, next) => {
    const { admin_id } = req.body

    let existingUser

    try {
        existingUser = await prisma.authority.findMany({
            where: { admin_id },
        })
    } catch (err) {
        const error = new HttpError('오류가 발생했습니다. 다시 시도해주세요.', 500)
        return next(error)
    }

    if (!existingUser[0]) {
        const error = new HttpError(
            '권한이 등록되지 않은 회원입니다. 권한을 먼저 등록해주세요',
            404
        )
        return next(error)
    }

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

    if (!isAccessible[0].is_super) {
        const error = new HttpError('허가되지 않은 접근입니다.', 403)
        return next(error)
    }

    try {
        await prisma.authority.delete({
            where: { id: existingUser[0].id },
        })
    } catch (err) {
        const error = new HttpError('삭제에 실패했습니다. 다시 시도해주세요.', 500)
        return next(error)
    }

    res.status(200).json({ message: '권한이 삭제되었습니다.' })
}

const updateAdmin = async(req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        console.log(errors)
        const error = new HttpError(
            '유효하지 않은 입력이 존재합니다. 다시 시도해주세요',
            422
        )
        return next(error)
    }

    const { name, password, region_id } = req.body
    const adminId = parseInt(req.params.aid)

    //TO-DO
    //만약 데이터가 비어있을경우.. 이름이나 비밀번호 지역번호 중 입력되지 않았을 때 기존 데이터 그대로 저장하기. 만약 null일 경우? 혹은 undefined 인가...
    //그럴때는 기존 데이터만 전송하거나 아니면 프리즈마에서 지원할지 모르겠는데 if사용해서 분배후 보내기

    let user

    try {
        user = await prisma.region.findUnique({ where: { id: adminId } })
    } catch (err) {
        const error = new HttpError('오류가 발생했습니다. 다시 시도해주세요.', 500)
        return next(error)
    }

    if (!user) {
        const error = new HttpError(
            '찾을 수 없는 사용자 입니다. 다시 시도해주세요.',
            404
        )
        return next(error)
    }

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

    if (!isAccessible[0].is_super) {
        const error = new HttpError('허가되지 않은 접근입니다.', 403)
        return next(error)
    }

    try {
        user = await prisma.admin.update({
            where: { id: adminId },
            data: { name, password, region_id },
        })
    } catch (err) {
        const error = new HttpError('에러가 발생했습니다. 다시 시도해주세요.', 500)
        return next(error)
    }

    res.status(200).json({ message: '수정에 성공했습니다.' })
}

const deleteAdmin = async(req, res, next) => {
    const adminId = parseInt(req.params.aid)

    let user

    try {
        user = await prisma.admin.findUnique({ where: { id: adminId } })
    } catch (err) {
        const error = new HttpError('에러가 발생했습니다. 다시 시도해주세요.', 500)
        return next(error)
    }

    //허가된 사용자만 지역을 검색할 수 있도록 기능 구현 예정

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

    if (!isAccessible[0].is_super) {
        const error = new HttpError('허가되지 않은 접근입니다.', 403)
        return next(error)
    }

    if (!user) {
        const error = new HttpError('찾을 수 없는 관리자입니다.', 404)
        return next(error)
    }

    try {
        user = await prisma.admin.delete({
            where: { id: adminId },
        })
    } catch (err) {
        const error = new HttpError('오류가 발생했습니다. 다시 시도해주세요', 500)
        return next(error)
    }

    res.status(200).json({ message: '삭제성공' })
}

export default {
    getAdmin,
    getAdminByName,
    adminAuthority,
    updateAdminAuthority,
    deleteAdminAuthority,
    getAdminById,
    signup,
    login,
    updateAdmin,
    deleteAdmin,
}