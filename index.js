var isString = require('./lib/isstring')
var isArray = Array.isArray

module.exports = function frameguard (options) {
  options = options || {}

  var domain = options.domain
  var action = options.action

  var directive
  if (action === undefined) {
    directive = 'SAMEORIGIN'
  } else if (isString(action)) {
    directive = action.toUpperCase()
  }

  if (directive === 'ALLOWFROM') {
    directive = 'ALLOW-FROM'
  } else if (directive === 'SAME-ORIGIN') {
    directive = 'SAMEORIGIN'
  }

  if (['DENY', 'ALLOW-FROM', 'SAMEORIGIN'].indexOf(directive) === -1) {
    throw new Error('X-Frame must be undefined, "DENY", "ALLOW-FROM", or "SAMEORIGIN"')
  }

  if (directive === 'ALLOW-FROM') {
    if (!isString(domain) && !isArray(domain)) {
      throw new Error('X-Frame: ALLOW-FROM requires a domain parameter')
    }
  }

  return function frameguard (req, res, next) {
    var xFrameValue = directive
    var hostname = req.hostname || req.headers.host

    if (directive === 'ALLOW-FROM') {
      if (isString(domain)) {
        xFrameValue = 'ALLOW-FROM ' + domain
      }

      if (isArray(domain)) {
        xFrameValue = 'ALLOW-FROM ' + (domain.indexOf(hostname) >= 0 ? hostname : domain[0])
      }
    }

    res.setHeader('X-Frame-Options', xFrameValue)
    next()
  }
}
