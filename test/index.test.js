const { test } = require('ava');

const resMsg = require('../');

const has = Object.hasOwnProperty;

test('get success msg without any input', (t) => {
  const msg = resMsg();

  t.is(Object.keys(msg).length, 2, 'should only have 2 keys');
  t.true(has.call(msg, 'success'));
  t.true(has.call(msg, 'data'));

  const { success, data } = msg;
  t.true(success, 'success flag');
  t.is(data, undefined, 'should be undefined when not giving data');
});

test('get success msg without any input', (t) => {
  const msg = resMsg(new Error('test'));

  t.is(Object.keys(msg).length, 4, 'should only have 4 keys');
  t.true(has.call(msg, 'success'));
  t.true(has.call(msg, 'error'));
  t.true(has.call(msg, 'code'));
  t.true(has.call(msg, 'stack'));

  const { success, error, code, stack } = msg;
  t.false(success, 'success flag');
  t.is(error, 'test', 'should use error.message');
  t.is(code, 400, 'should use default code');
  t.true(Array.isArray(stack), 'should be splited to array');
});
