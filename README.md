Frameguard
==========
[![Build Status](https://travis-ci.org/helmetjs/frameguard.svg?branch=master)](https://travis-ci.org/helmetjs/frameguard)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

[_Looking for a changelog?_](https://github.com/helmetjs/helmet/blob/master/HISTORY.md)

The `X-Frame-Options` HTTP header restricts who can put your site in a frame which can help mitigate things like [clickjacking attacks](https://en.wikipedia.org/wiki/Clickjacking). It has three modes: `DENY`, `SAMEORIGIN`, and `ALLOW-FROM`, defaulting to `SAMEORIGIN`. If your app does not need to be framed (and most don't) you can use `DENY`. If your site can be in frames from the same origin, you can set it to `SAMEORIGIN`. If you want to allow it from a specific URL, you can allow that with `ALLOW-FROM` and a URL.

Usage:

```javascript
var frameguard = require('frameguard')

// Don't allow me to be in ANY frames:
app.use(frameguard({ action: 'deny' }))

// Only let me be framed by people of the same origin:
app.use(frameguard({ action: 'sameorigin' }))
app.use(frameguard())  // defaults to sameorigin

// Allow from a specific host:
app.use(frameguard({
  action: 'allow-from',
  domain: 'http://example.com'
}))
```

This has pretty good (but not 100%) browser support: IE8+, Opera 10.50+, Safari 4+, Chrome 4.1+, and Firefox 3.6.9+. The `ALLOW-FROM` header option is [not supported in most browsers](https://developer.mozilla.org/en-US/docs/Web/HTTP/X-Frame-Options#Browser_compatibility). Those browsers will ignore the entire header, [and the frame *will* be displayed](https://www.owasp.org/index.php/Clickjacking_Defense_Cheat_Sheet#Limitations_2).

Allowing from multiple origins
------------------------------

The `ALLOW-FROM` header option only supports one origin, but you can allow multiple origins with nonstandard methods. This middleware does not support that, but here's how one might do it:

I run `evanhahn.com`. Let's say I want to allow iframes from `example.com` and `github.com`. These websites would include a query string parameter in the iframe URL, which I would check against a whitelist.

`example.com` might have some HTML like this:

```html
<iframe src="https://evanhahn.com/iframe?domain=https%3A%2F%2Fexample.com" />
```

And then `evanhahn.com` might have some code like this:

```js
// Define the URLs we'll allow.
var ALLOWED_BY = new Set([
  'https://example.com',
  'https://github.com'
])

app.get('/iframe', function (req, res) {
  // Is the URL in the whitelist?
  // Set X-Frame-Options if so. Otherwise, we won't
  // set the header and browsers will block it.
  var domain = String(req.query.domain)
  if (ALLOWED_BY.has(domain)) {
    res.setHeader('X-Frame-Options', 'ALLOW-FROM ' + domain)
  }

  // Send the iframe as usual.
  res.sendFile('iframe.html')
})
```
