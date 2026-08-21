const sendSuccess = (res, status, data, message = 'Success') => {
  res.status(status).json({ data, message, status });
};

const sendError = (res, status, error) => {
  res.status(status).json({ error, status });
};

module.exports = { sendSuccess, sendError };
