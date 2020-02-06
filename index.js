const cheerio = require('cheerio')
const { generateSW } = require('workbox-build')

function generateSWSnippet(minify) {
  return minify ? '<script>"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("sw.js")})</script>' : `
<script>
// Check that service workers are supported
if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js');
  });
}
</script>
`
}

exports.injectSWHtml = injectSWHtml
function injectSWHtml(html, minify) {
  const $ = cheerio.load(html)
  $('body').append(generateSWSnippet(minify))
  // If input html is empty, we simply output the content of <body>
  return html ? $.html() : $('body').html()
}

exports.generateSW = generateSW
