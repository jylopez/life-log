#!/usr/bin/env node
var program = require('commander')
var fs = require('fs')
var co = require('co')
var prompt = require('co-prompt')

// Get user's home directory
var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
var defaultConfigPath = home + '/.life_log_config'
var fileConfigExists = null
var defaultLifeLogPath = home + '/life_log.txt'
var newConfigFile = {
  'notebooks': {
    'default': defaultLifeLogPath
  }
}

// Timestamp
var getTime = function () {
  var timestamp = new Date()
  var addZero = function (value) {
    value = value < 10 ? '0' + value : value
    return value
  }
  return timestamp.getFullYear() + '-' + addZero((timestamp.getMonth() + 1)) + '-' + addZero(timestamp.getDate()) + ' ' + addZero(timestamp.getHours()) + ':' + addZero(timestamp.getMinutes())
}


try {
  fileConfigExists = fs.statSync(defaultConfigPath).isFile()
} catch (e) {
  fileConfigExists = false
}

// If config exists, write entry into existing notebook
if (fileConfigExists) {
  var obj = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'))

  program
    .version('v0.5.3')
    .arguments('<entry>')
    .parse(process.argv)

  if (!program.args.length) {
    co(function* () {
      // Add prompts here
      var scriptures = yield prompt('Did you read the scriptures? ')
      var exercise = yield prompt('Did you exercise? ')
      var read = yield prompt('Did you read? ')
      var entry = {
        scriptures: scriptures,
        exercise: exercise,
        read: read
      }

      fs.appendFileSync(obj.notebooks.default, getTime() + ' ' + JSON.stringify(entry, 2) + '\n\n')
      console.log('Boom. JSON saved.')
      process.exit()
    })
  } else {
    var entry = program.args.join(' ')
    fs.appendFileSync(obj.notebooks.default, getTime() + ' ' + entry + '\n\n')
    console.log('Yeet. Line added.')
  }
}
// If config doesn't exist, exist it.
else {
  co(function* () {
    var notebookPath = yield prompt('First time here ey. Where would you like to store your notebook? (leave blank for ' + home + '/life_log.txt): ')
    newConfigFile.notebooks.default = notebookPath ? notebookPath : newConfigFile.notebooks.default
    fs.closeSync(fs.openSync(defaultConfigPath, 'w'))
    fs.writeFileSync(defaultConfigPath, JSON.stringify(newConfigFile, '', 2))
    console.log('Config set up. Ready to life-log.')
    process.exit()
  })
}

// Handle exits with CTRL+C
process.on('SIGINT', function () {
  console.log('\n Nothing was saved.')
  process.exit()
})
