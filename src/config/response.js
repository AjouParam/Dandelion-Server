const resultResponse = (message, status = false, data = {}) => {
  return {
    status: status ? 'SUCCESS' : 'FAILED',
    message: message,
    ...data,
  };
};

const basicResponse = (message, status = false) => {
  return {
    status: status ? 'SUCCESS' : 'FAILED',
    message: message,
  };
};

module.exports = { resultResponse, basicResponse };
