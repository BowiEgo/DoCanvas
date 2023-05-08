const path = require('path')
const { uglify } = require('rollup-plugin-uglify')
const configList = require('./rollup.config')

const resolveFile = function (filePath) {
  return path.join(__dirname, '..', filePath)
}

configList.map((config, index) => {
  config.output.sourcemap = false
  config.output = {
    file: [resolveFile('lib/x-canvas.umd.js')],
    format: 'umd',
    name: 'XCanvas'
  }
  config.plugins = [...config.plugins, ...[uglify()]]
})

module.exports = configList
