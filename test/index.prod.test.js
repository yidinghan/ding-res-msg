const { test } = require('ava');

process.env.NODE_ENV = 'prod';

const resMsg = require('../');

const has = Object.hasOwnProperty;

test('get failed msg without stack when NODE_ENV:prod', (t) => {
  const msg = resMsg(new Error('test'));

  t.is(Object.keys(msg).length, 3, 'should only have 3 keys');
  t.true(has.call(msg, 'success'));
  t.true(has.call(msg, 'error'));
  t.true(has.call(msg, 'code'));
  t.false(has.call(msg, 'stack'));

  const { success, error, code } = msg;
  t.false(success, 'success flag');
  t.is(error, 'test', 'should use error.message');
  t.is(code, 400, 'should use default code');
});

test('get failed msg with stack when NODE_ENV:prod but isProduction:true', (t) => {
  const msg = resMsg({ error: 'test', isProduction: false });

  t.is(Object.keys(msg).length, 4, 'should only have 4 keys');
  t.true(has.call(msg, 'stack'));

  const { stack } = msg;
  t.true(Array.isArray(stack), 'should be splited to array');
  t.is(stack[0], 'Error: test');
});
