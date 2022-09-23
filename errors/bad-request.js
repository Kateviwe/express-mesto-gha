const ERROR_CODE_BAD_REQUEST = 400;

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CastError';
    this.statusCode = ERROR_CODE_BAD_REQUEST;
  }
}

module.exports = {
  BadRequestError,
};
