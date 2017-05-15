const { test } = require('ava');

process.env.NODE_ENV = 'prod';

const resMsg = require('../');

const has = Object.hasOwnProperty;

test('get success msg without any input', (t) => {
  const msg = resMsg(new Error('test'));

  t.is(Object.keys(msg).length, 3, 'should only have 2 keys');
  t.true(has.call(msg, 'success'));
  t.true(has.call(msg, 'error'));
  t.true(has.call(msg, 'code'));
  t.false(has.call(msg, 'stack'));

  const { success, error, code } = msg;
  t.false(success, 'success flag');
  t.is(error, 'test', 'should use error.message');
  t.is(code, 400, 'should use default code');
});
