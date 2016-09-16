var frameguard = require('..')

var connect = require('connect')
var request = require('supertest')
var assert = require('assert')

describe('frameguard', function () {
  function hello (req, res) {
    res.end('Hello world!')
  }

  var app
  beforeEach(function () {
    app = connect()
  })

  describe('defaults', function () {
    it('sets header to SAMEORIGIN with no arguments', function (done) {
      app.use(frameguard()).use(hello)
      request(app).get('/')
      .expect('X-Frame-Options', 'SAMEORIGIN', done)
    })

    it('sets header to SAMEORIGIN with no options', function (done) {
      app.use(frameguard({})).use(hello)
      request(app).get('/')
        .expect('X-Frame-Options', 'SAMEORIGIN', done)
    })
  })

  describe('deny', function () {
    it('sets header to DENY when called with lowercase "deny"', function (done) {
      app.use(frameguard({ action: 'deny' })).use(hello)
      request(app).get('/')
      .expect('X-Frame-Options', 'DENY', done)
    })

    it('sets header to DENY when called with uppercase "DENY"', function (done) {
      app.use(frameguard({ action: 'DENY' })).use(hello)
      request(app).get('/')
      .expect('X-Frame-Options', 'DENY', done)
    })
  })

  describe('sameorigin', function () {
    it('sets header to SAMEORIGIN when called with lowercase "sameorigin"', function (done) {
      app.use(frameguard({ action: 'sameorigin' })).use(hello)
      request(app).get('/')
      .expect('X-Frame-Options', 'SAMEORIGIN', done)
    })

    it('sets header to SAMEORIGIN when called with lowercase "same-origin"', function (done) {
      app.use(frameguard({ action: 'same-origin' })).use(hello)
      request(app).get('/')
      .expect('X-Frame-Options', 'SAMEORIGIN', done)
    })

    it('sets header to SAMEORIGIN when called with uppercase "SAMEORIGIN"', function (done) {
      app.use(frameguard({ action: 'SAMEORIGIN' })).use(hello)
      request(app).get('/')
      .expect('X-Frame-Options', 'SAMEORIGIN', done)
    })
  })

  describe('allow-from', function () {
    describe('with a string domain', function () {
      it('sets header properly when called with lowercase "allow-from"', function (done) {
        app.use(frameguard({
          action: 'allow-from',
          domain: 'http://example.com'
        })).use(hello)
        request(app).get('/')
        .expect('X-Frame-Options', 'ALLOW-FROM http://example.com', done)
      })

      it('sets header properly when called with uppercase "ALLOW-FROM"', function (done) {
        app.use(frameguard({
          action: 'ALLOW-FROM',
          domain: 'http://example.com'
        })).use(hello)
        request(app).get('/')
        .expect('X-Frame-Options', 'ALLOW-FROM http://example.com', done)
      })

      it('sets header properly when called with lowercase "allowfrom"', function (done) {
        app.use(frameguard({
          action: 'allowfrom',
          domain: 'http://example.com'
        })).use(hello)
        request(app).get('/')
        .expect('X-Frame-Options', 'ALLOW-FROM http://example.com', done)
      })

      it('sets header properly when called with uppercase "ALLOWFROM"', function (done) {
        app.use(frameguard({
          action: 'ALLOWFROM',
          domain: 'http://example.com'
        })).use(hello)
        request(app).get('/')
        .expect('X-Frame-Options', 'ALLOW-FROM http://example.com', done)
      })

      it('works with String object set to "SAMEORIGIN" and doesn\'t change the string', function (done) {
        var str = new String('SAMEORIGIN')  // eslint-disable-line
        app.use(frameguard({ action: str })).use(hello)
        request(app).get('/')
        .expect('X-Frame-Options', 'SAMEORIGIN', function (err) {
          assert.equal(str, 'SAMEORIGIN')
          done(err)
        })
      })

      it("works with ALLOW-FROM with String objects and doesn't change them", function (done) {
        var directive = new String('ALLOW-FROM')  // eslint-disable-line
        var url = new String('http://example.com')  // eslint-disable-line
        app.use(frameguard({
          action: directive,
          domain: url
        }))
        app.use(hello)
        request(app).get('/')
        .expect('X-Frame-Options', 'ALLOW-FROM http://example.com', done)
        assert.equal(directive, 'ALLOW-FROM')
        assert.equal(url, 'http://example.com')
      })
    })

    describe('with an array of allowed domains', function () {
      it('sets header properly when called with an array of domains and a visitor hits one of the domains', function (done) {
        app.use(frameguard({
          action: 'ALLOW-FROM',
          domains: ['http://example.com', 'http://some-other.com']
        }))

        app.use(hello)
        request(app).get('/').set('Host', 'some-other.com')
          .expect('X-Frame-Options', 'ALLOW-FROM http://some-other.com', done)
      })

      it('defaults to the first domain if a visitor hits a domain not in the list', function (done) {
        app.use(frameguard({
          action: 'ALLOW-FROM',
          domains: ['http://example.com', 'http://some-other.com']
        }))

        app.use(hello)
        request(app).get('/').set('Host', 'github.com')
          .expect('X-Frame-Options', 'ALLOW-FROM http://example.com', done)
      })

      it('defaults to the first domain if a visitor hits a weirdly-named domain', function (done) {
        app.use(frameguard({
          action: 'ALLOW-FROM',
          domains: ['http://example.com', 'http://some-other.com']
        }))

        app.use(hello)
        request(app).get('/').set('Host', 'hasOwnProperty')
          .expect('X-Frame-Options', 'ALLOW-FROM http://example.com', done)
      })
    })
  })

  describe('improper input', function () {
    function callWith () {
      var args = arguments
      return function () {
        return frameguard.apply(this, args)
      }
    }

    it('fails with a bad action', function () {
      assert.throws(callWith({ action: ' ' }))
      assert.throws(callWith({ action: 'denyy' }))
      assert.throws(callWith({ action: 'DENNY' }))
      assert.throws(callWith({ action: ' deny ' }))
      assert.throws(callWith({ action: ' DENY ' }))
      assert.throws(callWith({ action: 123 }))
      assert.throws(callWith({ action: false }))
      assert.throws(callWith({ action: null }))
      assert.throws(callWith({ action: {} }))
      assert.throws(callWith({ action: [] }))
      assert.throws(callWith({ action: ['ALLOW-FROM', 'http://example.com'] }))
      assert.throws(callWith({ action: /cool_regex/g }))
    })

    it('fails with a bad domain if the action is "ALLOW-FROM"', function () {
      assert.throws(callWith({ action: 'ALLOW-FROM' }))
      assert.throws(callWith({ action: 'ALLOW-FROM', domain: null }))
      assert.throws(callWith({ action: 'ALLOW-FROM', domain: false }))
      assert.throws(callWith({ action: 'ALLOW-FROM', domain: 123 }))
      assert.throws(callWith({ action: 'ALLOW-FROM', domain: {} }))
    })

    it('fails with a bad domains if the action is "ALLOW-FROM"', function () {
      assert.throws(callWith({ action: 'ALLOW-FROM', domains: null }))
      assert.throws(callWith({ action: 'ALLOW-FROM', domains: false }))
      assert.throws(callWith({ action: 'ALLOW-FROM', domains: 123 }))
      assert.throws(callWith({ action: 'ALLOW-FROM', domains: [] }))
      assert.throws(callWith({ action: 'ALLOW-FROM', domains: {} }))
    })

    it('fails if there is a "domain" and a "domains" key in "ALLOW-FROM" mode', function () {
      assert.throws(callWith({
        action: 'ALLOW-FROM',
        domain: 'https://example.com',
        domains: ['http://example.com', 'http://some-other.com']
      }))
    })
  })

  it('names its function and middleware', function () {
    assert.equal(frameguard.name, 'frameguard')
    assert.equal(frameguard.name, frameguard().name)
  })
})
