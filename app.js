import express from 'express'
import bodyParser from 'body-parser'

import adminRouter from './routes/admin-routes.js'
import usersRouter from './routes/users-routes.js'

const app = express()

app.use(bodyParser.json())

app.use('/api/admin', adminRouter)

app.use('/api/users', usersRouter)

app.use((err, req, res, next) => {
    res
        .status(err.code || 500)
        .json({ message: err.message || 'An unknown Error occured' })
})

app.listen(8000)