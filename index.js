const program = require('commander')
const _ = require('lodash')
const pkg = require('./package.json')
const { project } = require('./src')
const version = pkg.version


program
  .version(version)
  
program
  .name('node-upng')
  .usage('[command] [options]')
  
program
  .command('add')
  .description('add one custom project')
  .action( () => project.add() )
  
/*program
  .command('list')
  .description('list all the projects')
  .action( () => project.list() )
  
program
  .command('use')
  .description('change project to project')
  .action( () => project.use() )
  */
program
  .command('start')
  .description('run one project ...')
  .action( () => project.start() )

// Parse and fallback to help if no args
if (_.isEmpty(program.parse(process.argv).args) && process.argv.length === 2) {
  program.help()
}