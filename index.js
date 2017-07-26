const isProd = /prod/.test(process.env.NODE_ENV);

/**
 * @typedef {Error|Object} InputPayload
 * @property {Error|string} error - failed response error
 * @property {*} data - success response data
 * @property {number} [code=400] - failed response error code
 * @property {boolean} [isPaging=false] - Whether to update the data object to msg
 * @property {boolean} [isProduction] - Whether to add the stack to the msg,
 *                  if true will not add
 */

/**
 * @typedef {Object} Message
 * @property {boolean} success - whether happend
 */

/**
 * format input arguments
 *
 * @param {InputPayload} payload
 * @return {InputPayload}
 */
const parseArguments = (payload = {}) => {
  if (payload.isBoom) {
    return {
      error: payload,
      code: payload.output.statusCode,
    };
  } else if (payload instanceof Error) {
    return { error: payload };
  }

  const error = payload.error;
  if (error !== undefined && typeof error === 'string') {
    return Object.assign(payload, {
      error: new Error(error),
    });
  }

  return payload;
};

/**
 * res msg formattor
 *
 * @param {InputPayload} [payload={}] - input arguments or Error
 * @return {Message} formatted response msg body,
 *                  if is failed msg and error have `code` or `statusCode`
 *                  msg.code would take that first
 * @example
 * const resMsg = require('ding-res-msg');
 * console.log(resMsg());
 * // { success: true, data: undefined }
 *
 * console.log(resMsg({ data: { total: 100 }, isPaging: true }));
 * // { success: true, total: 100 }
 *
 * console.log(resMsg({ error: new Error('test') }));
 * // { success: false, error: 'test', code: 400 }
 *
 * // Error field supports string error
 * console.log(resMsg({ error: 'test' }));
 * // { success: false, error: 'test', code: 400 }
 *
 * // You can put the error directly in the first place
 * console.log(resMsg(new Error('test')));
 * // { success: false, error: 'test', code: 400 }
 *
 * // Use error.code as msg.code
 * const error = new Error('test');
 * error.code = 503;
 * console.log(resMsg(error));
 * // { success: false, error: 'test', code: 503 }
 *
 * // customised msg.code without error.code;
 * console.log(resMsg({ error: new Error('test'), code: 500 }));
 * // { success: false, error: 'test', code: 500 }
 *
 * // NODE_ENV !== 'prod'
 * // You can get stack trace in the response body
 * // As long as you are not running in the production environment
 * console.log(resMsg(new Error('test')));
 * // { success: false, error: 'test', code: 400, stack: ['msg', '...'] }
 *
 * // NODE_ENV !== 'prod'
 * // You cannot get stack trace in the response body
 * // event you are not running in a not prod environment
 * console.log(resMsg({ error: 'test', isProduction: true }));
 * // { success: false, error: 'test', code: 400 }
 *
 * // NODE_ENV === 'prod'
 * // You can get stack trace in the response body
 * // event you are running in a prod environment
 * console.log(resMsg({ error: 'test', isProduction: false }));
 * // { success: false, error: 'test', code: 400, stack: ['msg', '...'] }
 */
const resMsg = (payload) => {
  const {
    error,
    data,
    code = 400,
    isPaging = false,
    isProduction,
  } = parseArguments(payload);

  let msg = { success: true, data };
  if (!error) {
    if (isPaging) {
      delete msg.data;
      Object.assign(msg, data);
    }
    return msg;
  }

  const finalCode = error.code || error.statusCode || code;
  // @ts-ignore
  msg = {
    success: false,
    error: error.message || error,
    code: finalCode,
  };

  const isNotStack =
    (isProduction === undefined ? isProd : isProduction) === true;
  if (isNotStack === false) {
    msg.stack =
      typeof error.stack === 'string' ? error.stack.split('\n') : error.stack;
  }

  return msg;
};

module.exports = resMsg;
