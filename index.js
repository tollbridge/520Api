require('dotenv').config()
const express = require('express')
const cors = require('cors')
const tollRouter = require('./api/routes/toll')

const port = process.env.PORT || 3000

const app = express()

app.use(require('morgan')('common'))
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))
app.use(tollRouter)
app.listen(port, () => console.log(`SERVER UP @ ${port}`))


