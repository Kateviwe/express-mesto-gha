// Создание кастомных ошибок
const ERROR_CODE_INCORRECT_INPUT = 400;
const ERROR_CODE_NO_PERMISSION = 403;
const ERROR_CODE_NOT_FOUND = 404;

class IncorrectInputError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = ERROR_CODE_INCORRECT_INPUT;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "CastError";
    this.statusCode = ERROR_CODE_NOT_FOUND;
  }
}

class NoPermissionError extends Error {
  constructor(message) {
    super(message);
    this.name = "NoPermissionError";
    this.statusCode = ERROR_CODE_NO_PERMISSION;
  }
}

module.exports = {
  IncorrectInputError,
  NotFoundError,
  NoPermissionError
};