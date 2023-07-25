import express from 'express'
import bodyParser from 'body-parser'
import { PrismaClient } from '@prisma/client'

import adminRouter from './routes/admin-routes.js'
import usersRouter from './routes/users-routes.js'
import notificationRouter from './routes/notification-routes.js'
import regionRouter from './routes/region-routes.js'

const prisma = new PrismaClient()
const app = express()

app.use(bodyParser.json())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    )
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE')

    next()
})

app.use('/api/admin', adminRouter)

app.use('/api/users', usersRouter)

app.use('/api/notification', notificationRouter)

app.use('/api/region', regionRouter)

app.use((err, req, res, next) => {
    res
        .status(err.code || 500)
        .json({ message: err.message || 'An unknown Error occured' })
})

prisma
    .$connect()
    .then(() => {
        app.listen(8000, () => {
            console.log(`server is running in 8000`)
        })
    })
    .catch(async(err) => {
        console.log(err)
        await prisma.$disconnect()
        process.exit(1)
    })