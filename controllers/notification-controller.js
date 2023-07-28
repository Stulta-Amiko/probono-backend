import { PrismaClient } from '@prisma/client'

import HttpError from '../../../backend/models/http-error'

const prisma = new PrismaClient()

const sendNotification = async(req, res, next) => {}

const receiveNotification = async(req, res, next) => {}

export default { sendNotification, receiveNotification }