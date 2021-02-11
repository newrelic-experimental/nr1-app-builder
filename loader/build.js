const fs = require('fs'),
  path = require('path'),
  util = require('util'),
  toId = require('to-js-identifier'),
  readDir = util.promisify(fs.readdir),
  writeFile = util.promisify(fs.writeFile)

const buildAppJs = dir => {
  return readDir(dir, { withFileTypes: true })
    .then(files => {
      let htmlFiles = [],
        imports

      files.forEach(value => {
        if (!(
          value.isFile() &&
          value.name.endsWith('.html')
        )) {
          return
        }

        const filePath = path.join(dir, value.name),
          parts = path.parse(filePath),
          fileName = parts.name,
          name = toId(fileName)

        htmlFiles.push({
          fileName,
          name
        })
      })

      source = `import config from '!raw-loader!./config.yml'\n`
      source += `import css from '!raw-loader!./style.css'\n`
      source += htmlFiles.reduce((accum, curr) => {
        return accum += `import ${curr.name} from '!raw-loader!./${curr.fileName}.html'\n`
      }, '')
      source += 'export default { config, css, views: [ '
      source += htmlFiles.reduce((accum, curr, index) => {
        if (index > 0) {
          accum += ', '
        }
        return accum += `{ id: '${curr.fileName === 'index' ? 'home' : curr.fileName}', content: ${curr.name} }`
      }, '')
      source += ' ]}'

      return source
    })
}

buildAppJs('./app')
.then(source => {
  return writeFile(
    './app/index.js',
    source
  )
})
.then(() => {
  console.log('Generated app/index.js')
})
.catch(err => {
  console.error(err)
})



