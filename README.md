# Frameguard

[![Build Status](https://travis-ci.org/helmetjs/frameguard.svg?branch=master)](https://travis-ci.org/helmetjs/frameguard)

**Trying to prevent:** Your page being put in a `<frame>` or `<iframe>` without your consent. This helps to prevent things like [clickjacking attacks](https://en.wikipedia.org/wiki/Clickjacking).

**How do we mitigate this:** The `X-Frame-Options` HTTP header restricts who can put your site in a frame. It has three modes: `DENY`, `SAMEORIGIN`, and `ALLOW-FROM`. If your app does not need to be framed (and most don't) you can use the default `DENY`. If your site can be in frames from the same origin, you can set it to `SAMEORIGIN`. If you want to allow it from a specific URL, you can allow that with `ALLOW-FROM` and a URL.

Usage:

```javascript
var frameguard = require('frameguard');

// Don't allow me to be in ANY frames:
app.use(frameguard('deny'));

// Only let me be framed by people of the same origin:
app.use(frameguard('sameorigin'));
app.use(frameguard());  // defaults to this

// Allow from a specific host:
app.use(frameguard('allow-from', 'http://example.com'));
```

**Limitations:** This has pretty good (but not 100%) browser support: IE8+, Opera 10.50+, Safari 4+, Chrome 4.1+, and Firefox 3.6.9+. It only prevents against a certain class of attack, but does so pretty well. It also prevents your site from being framed, which you might want for legitimate reasons.
