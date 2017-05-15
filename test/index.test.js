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
