const ERROR_CODE_USER_DUPLICATION = 409;

class UserDuplicationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = ERROR_CODE_USER_DUPLICATION;
  }
}

module.exports = {
  UserDuplicationError,
};
