const isProd = /prod/.test(process.env.NODE_ENV);

const parseArguments = (payload = {}) => {
  if (payload instanceof Error) {
    return { error: payload };
  }

  if (payload.error !== undefined && typeof payload.error === 'string') {
    return Object.assign(payload, {
      error: new Error(payload.error),
    });
  }

  return payload;
};

/**
 * res msg formattor
 *
 * @param {object} payload - input arguments or Error
 * @param {Error|string} payload.error - failed response error
 * @param {*} payload.data - success response data
 * @param {number} payload.code - failed response error code
 * @param {boolean} payload.isPagination - Whether to update the data object to msg
 * @return {object} formatted response msg body
 * @example
 * const resMsg = require('ding-res-msg');
 * console.log(resMsg());
 * // { success: true, data: undefined }
 */
const resMsg = (payload = {}) => {
  const {
    error,
    data,
    code = 400,
    isPagination = false,
  } = parseArguments(payload);

  let msg = { success: true, data };
  if (!error) {
    if (isPagination) {
      Object.assign(msg, data);
    }
    return msg;
  }

  const finalCode = error.code || error.statusCode || code;
  msg = { success: false, error, code: finalCode };
  msg.error = error.message || error;
  if (!isProd) {
    msg.stack = (typeof error.stack === 'string' && error.stack.split('\n')) || error.stack;
  }

  return msg;
};

module.exports = resMsg;
