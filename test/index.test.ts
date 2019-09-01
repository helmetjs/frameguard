import connect from 'connect';
import request from 'supertest';
import { IncomingMessage, ServerResponse } from 'http';

import frameguard = require('..')

describe('frameguard', () => {
  function app (middleware: ReturnType<typeof frameguard>): connect.Server {
    const result = connect();
    result.use(middleware);
    result.use((_req: IncomingMessage, res: ServerResponse) => {
      res.end('Hello world!');
    });
    return result;
  }

  it('sets header to SAMEORIGIN with no arguments', () => {
    return request(app(frameguard())).get('/')
      .expect('X-Frame-Options', 'SAMEORIGIN');
  });

  it('sets header to SAMEORIGIN with no options', () => {
    return request(app(frameguard({}))).get('/')
      .expect('X-Frame-Options', 'SAMEORIGIN');
  });

  describe('with proper input', () => {
    it('sets header to DENY when called with lowercase "deny"', () => {
      return request(app(frameguard({ action: 'deny' }))).get('/')
        .expect('X-Frame-Options', 'DENY');
    });

    it('sets header to DENY when called with uppercase "DENY"', () => {
      return request(app(frameguard({ action: 'DENY' }))).get('/')
        .expect('X-Frame-Options', 'DENY');
    });

    it('sets header to SAMEORIGIN when called with lowercase "sameorigin"', () => {
      return request(app(frameguard({ action: 'sameorigin' }))).get('/')
        .expect('X-Frame-Options', 'SAMEORIGIN');
    });

    it('sets header to SAMEORIGIN when called with lowercase "same-origin"', () => {
      return request(app(frameguard({ action: 'same-origin' }))).get('/')
        .expect('X-Frame-Options', 'SAMEORIGIN');
    });

    it('sets header to SAMEORIGIN when called with uppercase "SAMEORIGIN"', () => {
      return request(app(frameguard({ action: 'SAMEORIGIN' }))).get('/')
        .expect('X-Frame-Options', 'SAMEORIGIN');
    });

    it('sets header properly when called with lowercase "allow-from"', () => {
      return request(app(frameguard({
        action: 'allow-from',
        domain: 'http://example.com',
      }))).get('/')
        .expect('X-Frame-Options', 'ALLOW-FROM http://example.com');
    });

    it('sets header properly when called with uppercase "ALLOW-FROM"', () => {
      return request(app(frameguard({
        action: 'ALLOW-FROM',
        domain: 'http://example.com',
      }))).get('/')
        .expect('X-Frame-Options', 'ALLOW-FROM http://example.com');
    });

    it('sets header properly when called with lowercase "allowfrom"', () => {
      return request(app(frameguard({
        action: 'allowfrom',
        domain: 'http://example.com',
      }))).get('/')
        .expect('X-Frame-Options', 'ALLOW-FROM http://example.com');
    });

    it('sets header properly when called with uppercase "ALLOWFROM"', () => {
      return request(app(frameguard({
        action: 'ALLOWFROM',
        domain: 'http://example.com',
      }))).get('/')
        .expect('X-Frame-Options', 'ALLOW-FROM http://example.com');
    });
  });

  describe('with improper input', () => {
    it('fails with a bad action', () => {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      expect(frameguard.bind(null, { domain: undefined })).toThrow();
      expect(frameguard.bind(null, { domain: 'https://example.com' })).toThrow();
      expect(frameguard.bind(null, { action: 'sameorigin', domain: 'https://example.com' })).toThrow();
      expect(frameguard.bind(null, { action: 'deny', domain: 'https://example.com' })).toThrow();
      expect(frameguard.bind(null, { action: ' ' })).toThrow();
      expect(frameguard.bind(null, { action: 'denyy' })).toThrow();
      expect(frameguard.bind(null, { action: 'DENNY' })).toThrow();
      expect(frameguard.bind(null, { action: ' deny ' })).toThrow();
      expect(frameguard.bind(null, { action: ' DENY ' })).toThrow();
      expect(frameguard.bind(null, { action: new String('SAMEORIGIN') as any })).toThrow(); // eslint-disable-line no-new-wrappers
      expect(frameguard.bind(null, { action: 123 as any })).toThrow();
      expect(frameguard.bind(null, { action: false as any })).toThrow();
      expect(frameguard.bind(null, { action: undefined as any })).toThrow();
      expect(frameguard.bind(null, { action: null as any })).toThrow();
      expect(frameguard.bind(null, { action: {} as any })).toThrow();
      expect(frameguard.bind(null, { action: [] as any })).toThrow();
      expect(frameguard.bind(null, { action: ['ALLOW-FROM', 'http://example.com'] as any })).toThrow();
      expect(frameguard.bind(null, { action: /cool_regex/g as any })).toThrow();
      /* eslint-enable @typescript-eslint/no-explicit-any */
    });

    it('fails with a bad domain if the action is "ALLOW-FROM"', () => {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      expect(frameguard.bind(null, { action: 'ALLOW-FROM' })).toThrow();
      expect(frameguard.bind(null, { action: 'ALLOW-FROM', domain: null as any })).toThrow();
      expect(frameguard.bind(null, { action: 'ALLOW-FROM', domain: false as any })).toThrow();
      expect(frameguard.bind(null, { action: 'ALLOW-FROM', domain: 123 as any })).toThrow();
      expect(frameguard.bind(null, { action: 'ALLOW-FROM', domain: '' })).toThrow();
      expect(frameguard.bind(null, { action: 'ALLOW-FROM', domain: ['http://website.com', 'http//otherwebsite.com'] as any })).toThrow();
      expect(frameguard.bind(null, { action: 'ALLOW-FROM', domain: new String('https://example.com') as any })).toThrow(); // eslint-disable-line no-new-wrappers
      /* eslint-enable @typescript-eslint/no-explicit-any */
    });
  });

  it('names its function and middleware', () => {
    expect(frameguard.name).toBe('frameguard');
    expect(frameguard.name).toBe(frameguard().name);
  });
});
