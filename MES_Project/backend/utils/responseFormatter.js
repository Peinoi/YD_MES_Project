// utils/responseFormatter.js
exports.success = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    code: `S${statusCode}`,
    data: data,
  });
};

exports.error = (res, message, statusCode = 500) => {
  res.status(statusCode).json({
    code: `E${statusCode}`,
    msg: message,
  });
};
