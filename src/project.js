const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')
const inquirer = require('inquirer')
const { mounts } = require('kenote-mount')
const base = require('./base')
const ini = require('ini')
const isPng = require('is-png')
const UPNG = require('upng-js')

const { 
  projectQuest,
  listQuest
} = mounts(path.resolve(__dirname, './questions'), 'quest')
const upngsIni = path.resolve(process.env.HOME || process.env.HOMEPATH, '.kenote_upngs.ini')
!fs.existsSync(upngsIni) && fs.writeFileSync(upngsIni, '', { encoding: 'utf-8'})
const defaultOptions = {
  cnum: 256
}

exports.add = () => {
  return inquirer.prompt(projectQuest)
    .then( answers => {
      let config = ini.parse(fs.readFileSync(upngsIni, 'utf-8'))
      let data = ini.stringify(Object.assign(config, { 
        [answers.name]: _.omit(answers, ['name']) 
      }), { whitespace: true })
      fs.writeFileSync(upngsIni, data, { encoding: 'utf-8'})
      console.log(`\n    add [${answers.name}] sccuess!\n`)
    })
}

exports.start = () => {
  let config = ini.parse(fs.readFileSync(upngsIni, 'utf-8'))
  let configKeys = _.keys(config) || []
  if (configKeys.length === 0) {
    console.log(`\n    please add one project!\n`)
    return
  }
  return inquirer.prompt(listQuest(configKeys))
    .then( answers => {
      let conf = config[answers.project]
      console.log('  ')
      let inputDir = fs.readdirSync(path.join(conf.input.replace(/^[\~]/, process.env.HOME || process.env.HOMEPATH)))
      for (let File of inputDir) {
        let inputFile = path.join(conf.input.replace(/^[\~]/, process.env.HOME || process.env.HOMEPATH), path.basename(File))
        let outputFile = path.join(conf.output.replace(/^[\~]/, process.env.HOME || process.env.HOMEPATH), path.basename(File))
        runUPNG(inputFile, outputFile, defaultOptions)
      }
      console.log(`\n    start [${answers.project}] sccuess!\n`)
    })
}

const runUPNG = (inputDir, outputDir, options = defaultOptions) => {
  const input = fs.readFileSync(inputDir)
  const img = UPNG.decode(input)
  const output = Buffer.from(
    UPNG.encode(
      UPNG.toRGBA8(img),
      img.width,
      img.height,
      options.cnum,
      img.frames.map( (frame) => {
        return frame.delay
      })
    )
  )
  console.log('   ', inputDir, '=>', outputDir)
  fs.writeFileSync(outputDir, output)
}