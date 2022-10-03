const ERROR_CODE_NOT_AUTH = 401;

class NotAuth extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotAuthorised';
    this.statusCode = ERROR_CODE_NOT_AUTH;
  }
}

module.exports = {
  NotAuth,
};
