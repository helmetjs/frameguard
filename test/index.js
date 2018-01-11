var frameguard = require('..')

var connect = require('connect')
var request = require('supertest')
var assert = require('assert')

describe('frameguard', function () {
  function app () {
    var result = connect()
    result.use(frameguard.apply(null, arguments))
    result.use(function (req, res) {
      res.end('Hello world!')
    })
    return result
  }

  it('sets header to SAMEORIGIN with no arguments', function () {
    return request(app()).get('/')
      .expect('X-Frame-Options', 'SAMEORIGIN')
  })

  it('sets header to SAMEORIGIN with no options', function () {
    return request(app({})).get('/')
      .expect('X-Frame-Options', 'SAMEORIGIN')
  })

  describe('with proper input', function () {
    it('sets header to DENY when called with lowercase "deny"', function () {
      return request(app({ action: 'deny' })).get('/')
        .expect('X-Frame-Options', 'DENY')
    })

    it('sets header to DENY when called with uppercase "DENY"', function () {
      return request(app({ action: 'DENY' })).get('/')
        .expect('X-Frame-Options', 'DENY')
    })

    it('sets header to SAMEORIGIN when called with lowercase "sameorigin"', function () {
      return request(app({ action: 'sameorigin' })).get('/')
        .expect('X-Frame-Options', 'SAMEORIGIN')
    })

    it('sets header to SAMEORIGIN when called with lowercase "same-origin"', function () {
      return request(app({ action: 'same-origin' })).get('/')
        .expect('X-Frame-Options', 'SAMEORIGIN')
    })

    it('sets header to SAMEORIGIN when called with uppercase "SAMEORIGIN"', function () {
      return request(app({ action: 'SAMEORIGIN' })).get('/')
        .expect('X-Frame-Options', 'SAMEORIGIN')
    })

    it('sets header properly when called with lowercase "allow-from"', function () {
      return request(app({
        action: 'allow-from',
        domain: 'http://example.com'
      })).get('/')
        .expect('X-Frame-Options', 'ALLOW-FROM http://example.com')
    })

    it('sets header properly when called with uppercase "ALLOW-FROM"', function () {
      return request(app({
        action: 'ALLOW-FROM',
        domain: 'http://example.com'
      })).get('/')
        .expect('X-Frame-Options', 'ALLOW-FROM http://example.com')
    })

    it('sets header properly when called with lowercase "allowfrom"', function () {
      return request(app({
        action: 'allowfrom',
        domain: 'http://example.com'
      })).get('/')
        .expect('X-Frame-Options', 'ALLOW-FROM http://example.com')
    })

    it('sets header properly when called with uppercase "ALLOWFROM"', function () {
      return request(app({
        action: 'ALLOWFROM',
        domain: 'http://example.com'
      })).get('/')
        .expect('X-Frame-Options', 'ALLOW-FROM http://example.com')
    })

    it('works with String object set to "SAMEORIGIN" and doesn\'t change them', function (done) {
      var str = new String('SAMEORIGIN')  // eslint-disable-line no-new-wrappers
      request(app({ action: str })).get('/')
        .expect('X-Frame-Options', 'SAMEORIGIN', function (err) {
          if (err) { return done(err) }
          assert.equal(str, 'SAMEORIGIN')
          done()
        })
    })

    it("works with ALLOW-FROM with String objects and doesn't change them", function (done) {
      var directive = new String('ALLOW-FROM')  // eslint-disable-line no-new-wrappers
      var url = new String('http://example.com')  // eslint-disable-line no-new-wrappers
      request(app({
        action: directive,
        domain: url
      })).get('/')
        .expect('X-Frame-Options', 'ALLOW-FROM http://example.com', function (err) {
          if (err) { return done(err) }
          assert.equal(directive, 'ALLOW-FROM')
          assert.equal(url, 'http://example.com')
          done()
        })
    })
  })

  describe('with improper input', function () {
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
      assert.throws(callWith({ action: 'ALLOW-FROM', domain: '' }))
      assert.throws(callWith({ action: 'ALLOW-FROM', domain: ['http://website.com', 'http//otherwebsite.com'] }))
    })
  })

  it('names its function and middleware', function () {
    assert.equal(frameguard.name, 'frameguard')
    assert.equal(frameguard.name, frameguard().name)
  })
})
