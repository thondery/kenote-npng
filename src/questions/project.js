const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')

module.exports = [
  {
    type: 'input',
    name: 'name',
    message: 'name',
    default: 'my-project',
    validate: validName.bind(this)
  },
  {
    type: 'input',
    name: 'input',
    message: 'input',
    validate: validDir.bind(this, 'input')
  },
  {
    type: 'input',
    name: 'output',
    message: 'output',
    validate: validDir.bind(this, 'input')
  },
]

function validName (value) {
  if (_.isEmpty(value.replace(/\s+/, ''))) {
    return 'name not isnull'
  }
  return true
}

function validDir (tag, value) {
  if (_.isEmpty(value.replace(/\s+/, ''))) {
    return `${tag} path not isnull`
  }
  let tagDir = value.replace(/^[\~]/, process.env.HOME || process.env.HOMEPATH)
  if (!fs.existsSync(path.resolve(tagDir))) {
    return `${tag} path not exists`
  }
  return true
}