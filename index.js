const isProd = /prod/.test(process.env.NODE_ENV);

const resMsg = (error, data, statusCode = 400, isPagination = false) => {
  let msg = { success: true, data };
  if (!error) {
    if (isPagination) {
      Object.assign(msg, data);
    }
    return msg;
  }

  const code = error.statusCode || statusCode;
  msg = { success: false, error, code };
  msg.error = error.message || error;
  if (!isProd) {
    msg.stack = (typeof error.stack === 'string' && error.stack.split('\n')) || error.stack;
  }

  return msg;
};

module.exports = resMsg;
