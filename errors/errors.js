// Создание кастомных ошибок
const ERROR_CODE_INCORRECT_INPUT = 400;
const ERROR_CODE_NOT_FOUND = 404;

class IncorrectInputError extends Error {
  constructor(message) {
    super(message);
    this.name = "IncorrectInputError";
    this.statusCode = ERROR_CODE_INCORRECT_INPUT;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = ERROR_CODE_NOT_FOUND;
  }
}

module.exports = {
  IncorrectInputError,
  NotFoundError
};