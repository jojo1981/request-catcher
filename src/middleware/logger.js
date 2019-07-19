import morgan from 'morgan'
import fs from 'fs'
import path from 'path'
import rfs from 'rotating-file-stream'

const logDirectory = path.join(__dirname, '../../logs')

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// create a rotating write stream
const accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory
})

export const loggerMiddleWare = morgan('combined', { stream: accessLogStream })
