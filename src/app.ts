import express from 'express'
import router from './router'
import dataHandler from './dataHandler'

const app = express()
const port = 3000

dataHandler

app.disable('x-powered-by')

app.use(router)

app.listen(port, () => console.log(`[%s] Server listening at http://127.0.0.1:${port}`, (new Date()).toUTCString()))