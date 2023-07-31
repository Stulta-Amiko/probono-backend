import { PrismaClient } from '@prisma/client'
import HttpError from '../../../backend/models/http-error'

const prisma = new PrismaClient()

const getUserByRegionId = async(req, res, next) => {}

const getUserByAdminId = async(req, res, next) => {}

const getUserByName = async(req, res, next) => {}

const createUser = async(req, res, next) => {}

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