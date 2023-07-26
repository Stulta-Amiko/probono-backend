import { validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

import HttpError from '../../../backend/models/http-error'
import { PrismaClient } from '@prisma/client'

dotenv.config()
const JWTKEY = process.env.TOKEN_KEY
const prisma = new PrismaClient()

const getAdminById = async(req, res, next) => {}

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
        console.log(await prisma.admin.findMany({ where: { email: email } }))
    } catch (err) {
        const error = new HttpError('회원가입에 실패했습니다. (초기오류)', 500)
        return next(error)
    }

    if (existingUser) {
        const error = new HttpError(
            '이미 회원가입 된 회원입니다. 로그인 해주세요.',
            422
        )
        return next(error)
    }

    let hashedPassword

    // 비밀번호 생성 bcrypt 이용

    try {
        hashedPassword = await bcrypt.hash(password, 12)
    } catch (err) {
        const error = new HttpError(
            '회원가입에 실패했습니다. 다시 시도해주세요. (bcrypt 패키지 관련)',
            422
        )
        return next(error)
    }

    /*const createdUser = */ //유저 생성과정

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

    const user = await prisma.admin.findUnique({
        where: {
            email: email,
        },
    })

    try {
        token = jwt.sign({ adminId: user.id, email: user.email }, JWTKEY, {
            expiresIn: '1h',
        })
    } catch (err) {
        const error = new HttpError(
            '회원가입에 실패했습니다. 다시 시도해주세요.(토큰관련)',
            500
        )
        return next(error)
    }
    res.status(201).json({}) //로그인 성공시 유저 정보 및 토큰 전송
}

const login = async(req, res, next) => {
    const { email, password } = req.body

    let existingUser

    try {
        //존재하는 유저일 경우 existiongUser에 대조후 맞는값 찾아서 반환
    } catch (err) {
        const error = new HttpError('로그인에 실패했습니다. 다시 시도해주세요', 500)
        return next(error)
    }

    if (!existingUser) {
        const error = new HttpError('유효하지 않은 정보가 입력되었습니다.', 403)
        return next(error)
    }

    let isValidPassword = false

    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password) // bcrypt 이용해서 암호화된 비밀번호와 입력된 비밀번호 일치하는지 여부 판단
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
    } catch (err) {
        const error = new HttpError(
            '회원가입에 실패했습니다. 다시 시도해주세요.(토큰관련)',
            500
        )
        return next(error)
    }

    res.json({}) //유저 아이디, 이메일, 토큰 전송
}

export default { getAdminById, signup, login }