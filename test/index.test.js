const { test } = require('ava');

const resMsg = require('../');


test('get success msg without any input', (t) => {
  const { success, data } = resMsg({});
  t.true(success, 'success flag');
  t.is(data, undefined, 'should be undefined when not giving data');
});
