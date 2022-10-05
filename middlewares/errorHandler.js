// Мидлвэр для централизованной обработки ошибок
const ERROR_CODE = 500;

module.exports = (err, req, res, next) => {
  // Если ошибка сгенерирована не нами, у неё не будет свойства statusCode
  if (err.statusCode) {
    res.status(err.statusCode).send({ message: err.message });
  } else {
    res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
  }
  next();
};
