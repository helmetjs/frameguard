var isString = require('./lib/isstring')
var parseHostname = require('./lib/parse-hostname')
var isArray = Array.isArray

module.exports = function frameguard (options) {
  options = normalizeOptions(options)

  checkOptions(options)

  if ((options.action === 'ALLOW-FROM') && options.domains) {
    var allowedHostnames = options.domains.reduce(function (result, domain) {
      result[parseHostname(domain)] = domain
      return result
    }, {})

    return function frameguard (req, res, next) {
      var hostname = req.hostname || req.headers.host
      if (allowedHostnames.hasOwnProperty(hostname)) {
        res.setHeader('X-Frame-Options', 'ALLOW-FROM ' + allowedHostnames[hostname])
      } else {
        res.setHeader('X-Frame-Options', 'ALLOW-FROM ' + options.domains[0])
      }

      next()
    }
  } else {
    var value = options.action
    if (options.action === 'ALLOW-FROM') {
      value = 'ALLOW-FROM ' + options.domain
    }

    return function frameguard (req, res, next) {
      res.setHeader('X-Frame-Options', value)
      next()
    }
  }
}

function normalizeOptions (options) {
  options = options || {}

  var action = options.action
  if (action === undefined) {
    action = 'SAMEORIGIN'
  } else if (isString(action)) {
    action = action.toUpperCase()
  }

  if (action === 'ALLOWFROM') {
    action = 'ALLOW-FROM'
  } else if (action === 'SAME-ORIGIN') {
    action = 'SAMEORIGIN'
  }

  return {
    action: action,
    domain: options.domain,
    domains: options.domains
  }
}

function checkOptions (options) {
  if (['DENY', 'ALLOW-FROM', 'SAMEORIGIN'].indexOf(options.action) === -1) {
    throw new Error('X-Frame must be undefined, "DENY", "ALLOW-FROM", or "SAMEORIGIN"')
  }

  if (options.action === 'ALLOW-FROM') {
    if (options.domain && options.domains) {
      throw new Error('X-Frame: ALLOW-FROM allows a domain parameter or a domains parameter. Please choose one')
    }

    if (isString(options.domain)) { return }

    if (isArray(options.domains) && options.domains.length) { return }

    throw new Error('X-Frame: ALLOW-FROM requires a domain string or a domains array')
  }
}
