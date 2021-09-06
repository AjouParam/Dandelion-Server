const resultResponse = (message, status = false, data = {}) => {
  return {
    status: status ? 'SUCCESS' : 'FAILED',
    message: message,
    ...data,
  };
};

const basickResponse = (message, status = false) => {
  return {
    status: status ? 'SUCCESS' : 'FAILED',
    message: message,
  };
};

module.exports = { resultResponse, basickResponse };
