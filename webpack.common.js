const path = require('path')

module.exports = {
  entry: './src/superwallet.js',
  output: {
    filename: 'superwallet.js',
    path: path.resolve(__dirname, 'dist')
  }
}
