Frameguard
==========
[![Build Status](https://travis-ci.org/helmetjs/frameguard.svg?branch=master)](https://travis-ci.org/helmetjs/frameguard)

The `X-Frame-Options` HTTP header restricts who can put your site in a frame which can help mitigate things like [clickjacking attacks](https://en.wikipedia.org/wiki/Clickjacking). It has two modes: `DENY` and `SAMEORIGIN`, defaulting to `SAMEORIGIN`. If your app does not need to be framed (and most don't) you can use `DENY`. If your site can be in frames from the same origin, you can set it to `SAMEORIGIN`.

Usage:

```javascript
const frameguard = require('frameguard')

// Don't allow me to be in ANY frames:
app.use(frameguard({ action: 'deny' }))

// Only let me be framed by people of the same origin:
app.use(frameguard({ action: 'sameorigin' }))
app.use(frameguard())  // defaults to sameorigin
```

This has pretty good (but not 100%) browser support: IE8+, Opera 10.50+, Safari 4+, Chrome 4.1+, and Firefox 3.6.9+.

If you want your site to be framed only by some parent pages, you can use the [`frame-ancestors` Content Security Policy directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors). You can do this by setting the `Content-Security-Policy` header directly, or by using [Helmet's Content Security Policy module](https://helmetjs.github.io/docs/csp/).

This header also supports an `ALLOW-FROM` directive (in place of `DENY` and `SAMEORIGIN`). This `ALLOW-FROM` directive is [not supported in Chrome, Firefox, Safari, and others](https://developer.mozilla.org/en-US/docs/Web/HTTP/X-Frame-Options#Browser_compatibility). Those browsers will ignore the entire header, [and the frame *will* be displayed](https://www.owasp.org/index.php/Clickjacking_Defense_Cheat_Sheet#Limitations_2), so you probably want to avoid using that option. It is currently supported in Frameguard but will be removed in the next major version.
