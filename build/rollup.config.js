const path = require('path')
const buble = require('@rollup/plugin-buble')
const typescript = require('@rollup/plugin-typescript')
const { uglify } = require('rollup-plugin-uglify')

const resolveFile = function (filePath) {
  return path.join(__dirname, '..', filePath)
}

module.exports = [
  {
    input: resolveFile('src/index.ts'),
    output: {
      file: resolveFile('lib/x-canvas.js'),
      format: 'umd',
      name: 'XCanvas'
    },
    plugins: [typescript(), buble()]
  },
  {
    input: resolveFile('src/index.ts'),
    output: {
      file: resolveFile('example/weapp/x-canvas.js'),
      format: 'umd',
      name: 'XCanvas'
    },
    plugins: [typescript(), buble(), ...[uglify()]]
  }
]
