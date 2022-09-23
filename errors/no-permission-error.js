// Создание кастомных ошибок
const ERROR_CODE_NO_PERMISSION = 403;

class NoPermissionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NoPermissionError';
    this.statusCode = ERROR_CODE_NO_PERMISSION;
  }
}

module.exports = {
  NoPermissionError,
};
