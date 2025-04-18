const path = require('path')

const isDev = process.env.NODE_ENV !== 'production'
const SERVER_HOST = '0.0.0.0'
const SERVER_PORT = 3000

const PROJECT_PATH = path.resolve(__dirname, '../')
const PROJECT_NAME = path.parse(PROJECT_PATH).name

const IS_OPEN_HARD_SOURCE = true

module.exports = {
  isDev,
  SERVER_HOST,
  SERVER_PORT,
  PROJECT_PATH,
  PROJECT_NAME,
  IS_OPEN_HARD_SOURCE
}
