const ERROR_CODE_NOT_FOUND = 404;

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "CastError";
    this.statusCode = ERROR_CODE_NOT_FOUND;
  }
}

module.exports = {
  NotFoundError,
};
