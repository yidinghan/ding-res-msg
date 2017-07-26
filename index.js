const isProd = /prod/.test(process.env.NODE_ENV);

const parseArguments = (payload = {}) => {
  if (payload instanceof Error) {
    return { error: payload };
  }

  const error = payload.error;
  if (error !== undefined) {
    if (typeof error === 'string') {
      return Object.assign(payload, {
        error: new Error(error),
      });
    } else if (error.isBoom) {
      return Object.assign(payload, {
        code: error.output.statusCode,
      });
    }
  }

  return payload;
};

/**
 * res msg formattor
 *
 * @param {Object} [payload] - input arguments or Error
 * @param {Error|string} payload.error - failed response error
 * @param {*} payload.data - success response data
 * @param {number} [payload.code=400] - failed response error code
 * @param {boolean} [payload.isPaging=[false] - Whether to update the data object to msg
 * @param {boolean} [payload.isProduction] - Whether to add the stack to the msg,
 *                  if true will not add
 * @return {Object} formatted response msg body,
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
  const { error, data, code = 400, isPaging = false, isProduction } = parseArguments(payload);

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

  const isNotStack = (isProduction === undefined ? isProd : isProduction) === true;
  if (isNotStack === false) {
    msg.stack = (typeof error.stack === 'string' && error.stack.split('\n')) || error.stack;
  }

  return msg;
};

module.exports = resMsg;
