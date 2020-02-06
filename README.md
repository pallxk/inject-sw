inject-sw
=========

[![inject-sw @ npm](https://badgen.net/npm/v/inject-sw)](https://www.npmjs.com/package/inject-sw)

A CLI & helper function to generate service worker files to precache assets and inject service worker code snippet into an html file using [Workbox](https://github.com/GoogleChrome/workbox).

The following is the code snippet to be inserted as the last item of `<body>`. It can optionally be inserted as minified.

```html
<script>
// Check that service workers are supported
if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js');
  });
}
</script>
```


## Install as CLI

```sh
npm i -g inject-sw
```

### Usage

```
inject-sw [--sw-config <config_file>] [ [-i|--input] <input_file> ] [
[-o|--output] <output_file> ] [--minify]

Options:
  --help        Show help                                              [boolean]
  --version     Show version number                                    [boolean]
  --sw-config   Config file for service worker generation
  -o, --output  path to output html file                [default: "/dev/stdout"]
  --minify      minify the service worker code snippet[boolean] [default: false]
  -i, --input                                            [default: "/dev/stdin"]
```

And the service worker config file defaults to the following:

```js
{
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
```

### Examples

```sh
# Reads from src/index.html and writes to dist/index.html
inject-sw -i src/index.html -o dist/index.html

# Write in-place
inject-sw -i index.html -o index.html

# Specify --minify to minify the service worker code snippet
# (Note that it does not minify other parts of the html page)
# Input and output can be specified as positional arguments
inject-sw --minify a.html b.html
```


## Install as package dependency

```sh
npm i inject-sw
```

### Usage & Examples

#### HTML string as arguments

API:

```js
const { injectSWHtml, generateSW } = require('inject-sw');

injectSWHtml(html, minify = false);

/* See https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.generateSW */
const config = {};
generateSW(config).then(result => {
  console.dir(result);
})
```

Code Example:

```js
const { injectSWHtml, generateSW } = require('inject-sw');
const html = '<!doctype html><html><head><title>Hello World</title></head><body>Morning World</body></html>';
const injectedHTML = injectSWHtml(html, true);
console.log(injectedHTML);

generateSW({
  "globDirectory": "dist/",
  "globPatterns": [
    "**/*.{html,css,js,json}",
    "**/*.{jpg,png,svg}"
  ],
  "swDest": "dist/sw.js"
})
```

#### Filename as arguments

API:

```js
const injectSWFile = require('inject-sw/cli');
injectSWFile(input, output, minify, swConfig);
```

Code Example:

```js
const injectSWFile = require('inject-sw/cli');

const inputFilename = 'a.html';
const outputFilename = 'b.html';
const minify = true;
const swConfig = {
  "globDirectory": "dist/",
  "globPatterns": [
    "**/*.{html,css,js,json}",
    "**/*.{jpg,png,svg}"
  ],
  "swDest": "dist/sw.js"
};
injectSWFile(inputFilename, outputFilename, minify, swConfig);
```


## Debug

Set environment variable `DEBUG` to `inject-sw`.


## LICENSE

[MIT](LICENSE)
