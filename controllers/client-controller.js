import { PrismaClient } from '@prisma/client'
import HttpError from '../../../backend/models/http-error'

const prisma = new PrismaClient()

const getUserByRegionId = async(req, res, next) => {}

const getUserByAdminId = async(req, res, next) => {}

const getUserByName = async(req, res, next) => {}

const createUser = async(req, res, next) => {}

const deleteUser = async(req, res, next) => {}

export default {
    getUserByName,
    getUserByAdminId,
    getUserByRegionId,
    createUser,
    deleteUser,
}