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

test('get failed msg with first arg is Error', (t) => {
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
  t.is(stack[0], 'Error: test');
});

test('get failed msg with object input', (t) => {
  const msg = resMsg({ error: new Error('test') });

  const { success, error, code, stack } = msg;
  t.false(success, 'success flag');
  t.is(error, 'test', 'should use error.message');
  t.is(code, 400, 'should use default code');
  t.true(Array.isArray(stack), 'should be splited to array');
});

test('get failed msg with object input', (t) => {
  const msg = resMsg({ error: new Error('test'), code: 500 });

  const { success, error, code } = msg;
  t.false(success, 'success flag');
  t.is(error, 'test', 'should use error.message');
  t.is(code, 500, 'should use customised code');
});

test('get failed msg with msg.code is error.code', (t) => {
  const err = new Error('test');
  err.code = 401;
  const msg = resMsg({ error: err });

  const { success, error, code } = msg;
  t.false(success, 'success flag');
  t.is(error, 'test', 'should use error.message');
  t.is(code, 401);
});

test('get failed msg with msg.statusCode is error.code', (t) => {
  const err = new Error('test');
  err.statusCode = 403;
  const msg = resMsg({ error: err });

  const { success, error, code } = msg;
  t.false(success, 'success flag');
  t.is(error, 'test', 'should use error.message');
  t.is(code, 403);
});

test('Get the failed msg by customizing error.stack', (t) => {
  const err = new Error('test');
  err.stack = { raw: err.stack, stack: err.stack.split('\n') };
  const msg = JSON.parse(JSON.stringify(resMsg({ error: err })));

  const { success, error, code, stack } = msg;
  t.false(success, 'success flag');
  t.is(error, 'test', 'should use error.message');
  t.is(code, 400);
  t.deepEqual(stack, err.stack);
});

test('get failed msg with array object', (t) => {
  const msg = resMsg({ error: ['test'] });

  const { success, error, code } = msg;
  t.false(success, 'success flag');
  t.deepEqual(error, ['test']);
  t.is(code, 400);
});

test('get failed msg with string error in payload field', (t) => {
  const msg = resMsg({ error: 'test' });

  const { success, error, code } = msg;
  t.false(success, 'success flag');
  t.is(error, 'test', 'should use error.message');
  t.is(code, 400);
});

test('get success msg with data', (t) => {
  const msg = resMsg({ data: 'success' });

  const { success, data } = msg;
  t.true(success, 'success flag');
  t.is(data, 'success');
});

test('get success msg with isPagination:true', (t) => {
  const msg = resMsg({ data: { total: 100 }, isPaging: true });

  const { success, data, total } = msg;
  t.true(success, 'success flag');
  t.is(data, undefined);
  t.is(total, 100);
});
