import * as nunjucks from 'nunjucks'
import * as path from 'node:path'

nunjucks.configure(path.resolve(__dirname, '../templates'))

const njks = nunjucks

export { njks }
