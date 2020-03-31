#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { injectSWHtml, generateSW } = require('.')

const log = require('debug')('inject-sw')

function injectSWFile(input, output, minify, swConfig, swUrl) {
  const html = fs.readFileSync(input, 'utf8')
  const outStream = fs.createWriteStream(output)
  outStream.write(injectSWHtml(html, minify, swUrl))

  generateSW(swConfig).then(result => {
    log('generateSW result: %O', result)
  }).catch(er => {
    console.error(er)
    process.exit(1)
  })
}

module.exports = injectSWFile

if (require.main !== module) {
  // cli.js is required as a dependency
  return
}

const argv = require('yargs')
  .scriptName('inject-sw')
  .usage('$0 [--sw-config <config_file>] [--sw-url <url>] [ [-i|--input] <input_file> ] [ [-o|--output] <output_file> ] [--minify]')
  .describe('sw-config', 'Config file for service worker generation. Defaults to workbox-config.js, with fallback to sane defaults.')
  .describe('sw-url', 'URL for generated sw.js')
  .default('sw-url', 'sw.js')
  .alias('i', 'input')
  .default('i', '/dev/stdin')
  .describe('o', 'path to output html file')
  .alias('o', 'output')
  .default('o', '/dev/stdout')
  .describe('minify', 'minify the service worker code snippet')
  .boolean('minify')
  .default('minify', false)
  .argv

if (argv._.length > 2) {
  console.error('Arguments more than needed specified')
  process.exit(1)
}

if (argv._[0]) {
  if (argv.i === '/dev/stdin') {
    argv.i = argv._[0]
  } else {
    console.error('Multiple input files specified')
    process.exit(1)
  }
}

if (argv._[1]) {
  if (argv.o === '/dev/stdout') {
    argv.o = argv._[1]
  } else {
    console.error('Multiple output files specified')
    process.exit(1)
  }
}

log('argv = %O', argv)

// Require swConfig if specified explicitly
let swConfig = argv.swConfig && require(argv.swConfig)

if (swConfig) {
  log('Using specified swConfig file: %s = %O', argv.swConfig, swConfig)
}
else {
  // Otherwise require workbox-config.js, with fallback to sane defaults
  const swConfigFile = path.resolve('./workbox-config.js')
  try {
    swConfig = require(swConfigFile)
    log('Using default swConfig file: %s = %O', swConfigFile, swConfig)
  } catch (ex) {
    swConfig = {
      // Write to the directory of the HTML file, fallback to current directory
      // if output is /dev/stdout.
      swDest: argv.o.startsWith('/dev')
        ? path.join(process.cwd(), 'sw.js')
        : path.resolve(argv.o, '../sw.js'),
      // Read assets from the directory of the input HTML file, fallback to current
      // directory if input is /dev/stdin.
      globDirectory: argv.i.startsWith('/dev')
        ? process.cwd()
        : path.resolve(argv.i, '..'),
      // Cache every single file by default
      globPatterns: ['**/*'],
      // Except files in node_modules
      globIgnores: [
        'node_modules/**/*',
        '**/*.map',
      ],
    }
    log('Using default swConfig: %O', swConfig)
  }
}

injectSWFile(argv.i, argv.o, argv.minify, swConfig, argv.swUrl)
