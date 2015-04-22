var isString = require('lodash.isstring');

module.exports = function frameguard(action, options) {

  var header;

  if (action === undefined) {
    header = 'SAMEORIGIN';
  } else if (isString(action)) {
    header = action.toUpperCase();
  }

  if (header === 'ALLOWFROM') {
    header = 'ALLOW-FROM';
  } else if (header === 'SAME-ORIGIN') {
    header = 'SAMEORIGIN';
  }

  if (['DENY', 'ALLOW-FROM', 'SAMEORIGIN'].indexOf(header) === -1) {
    throw new Error('X-Frame must be undefined, "DENY", "ALLOW-FROM", or "SAMEORIGIN"');
  }

  if (header === 'ALLOW-FROM') {
    if (!isString(options)) {
      throw new Error('X-Frame: ALLOW-FROM requires a second parameter');
    }
    header = 'ALLOW-FROM ' + options;
  }

  return function frameguard(req, res, next) {
    res.setHeader('X-Frame-Options', header);
    next();
  };

};
