var isString = require('./lib/isstring')
var parseHostname = require('./lib/parse-hostname')
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

  if ((directive === 'ALLOW-FROM') && (isArray(domain))) {
    var allowedHostnames = domain.reduce(function (result, d) {
      result[parseHostname(d)] = d
      return result
    }, {})

    return function frameguard (req, res, next) {
      var hostname = req.hostname || req.headers.host
      if (allowedHostnames.hasOwnProperty(hostname)) {
        res.setHeader('X-Frame-Options', 'ALLOW-FROM ' + allowedHostnames[hostname])
      } else {
        res.setHeader('X-Frame-Options', 'ALLOW-FROM ' + domain[0])
      }

      next()
    }
  } else {
    var value = directive
    if (directive === 'ALLOW-FROM') {
      value = 'ALLOW-FROM ' + domain
    }

    return function frameguard (req, res, next) {
      res.setHeader('X-Frame-Options', value)
      next()
    }
  }
}
