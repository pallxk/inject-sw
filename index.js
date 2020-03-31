const cheerio = require('cheerio')
const { generateSW } = require('workbox-build')

function generateSWSnippet(minify, swUrl = 'sw.js') {
  return minify ? `<script>"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("${swUrl}")})</script>` : `
<script>
// Check that service workers are supported
if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('${swUrl}');
  });
}
</script>
`
}

exports.injectSWHtml = injectSWHtml
function injectSWHtml(html, minify, swUrl) {
  const $ = cheerio.load(html)
  $('body').append(generateSWSnippet(minify, swUrl))
  // If input html is empty, we simply output the content of <body>
  return html ? $.html() : $('body').html()
}

exports.generateSW = generateSW
