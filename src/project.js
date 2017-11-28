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
      let upngRC = null
      try {
        upngRC = fs.readJSONSync(path.join(conf.input.replace(/^[\~]/, process.env.HOME || process.env.HOMEPATH), '.upngrc1'))
      } catch (error) {
        
      }
      fs.removeSync(path.join(conf.output.replace(/^[\~]/, process.env.HOME || process.env.HOMEPATH)))
      fs.mkdirpSync(path.join(conf.output.replace(/^[\~]/, process.env.HOME || process.env.HOMEPATH)))
      console.log('  ')
      let inputDir = readAllFile(path.join(conf.input.replace(/^[\~]/, process.env.HOME || process.env.HOMEPATH)), /\.png$/)
      for (let File of inputDir) {
        let inputFile = File
        let baseName = File.replace(conf.input.replace(/^[\~]/, process.env.HOME || process.env.HOMEPATH), '')
        let outputFile = path.join(conf.output.replace(/^[\~]/, process.env.HOME || process.env.HOMEPATH), baseName)
        if (/\.png$/.test(File)) {
          runUPNG(inputFile, outputFile, upngRC || defaultOptions)
        }
      }
      console.log(`\n    start [${answers.project}] sccuess!\n`)
    })
}

const runUPNG = (inputDir, outputDir, options = defaultOptions) => {
  const input = fs.readFileSync(inputDir)
  if (!isPng(input)) return
  const img = UPNG.decode(input)
  //console.log(img)
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
  let dirName = path.dirname(outputDir)
  !fs.existsSync(dirName) && fs.mkdirpSync(dirName)
  fs.writeFileSync(outputDir, output)
}

/*------------工具函数------------*/
/*
 * 读取指定文件夹下的全部文件，可通过正则进行过滤，返回文件路径数组
 * @param root 指定文件夹路径
 * [@param] reg 对文件的过滤正则表达式,可选参数
 *
 * 注：还可变形用于文件路径是否符合正则规则，路径可以是文件夹，也可以是文件，对不存在的路径也做了容错处理*/
function readAllFile(root, reg) {
  
  var resultArr = [];
  var thisFn = arguments.callee;
  if (fs.existsSync(root)) {//文件或文件夹存在

    var stat = fs.lstatSync(root); // 对于不存在的文件或文件夹，此函数会报错

    if (stat.isDirectory()) {// 文件夹
      var files = fs.readdirSync(root);
      files.forEach(function (file) {
        var t = thisFn(root + '/' + file, reg);
        resultArr = resultArr.concat(t);
      });

    } else {
      if (reg !== undefined) {

        if (typeof reg.test == 'function'
          && reg.test(root)) {
          resultArr.push(root);
        }
      }
      else {
        resultArr.push(root);
      }
    }
  }

  return resultArr;
}