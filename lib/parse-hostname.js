var url = require('url')

module.exports = function (urlString) {
  return url.parse(urlString).hostname
}
