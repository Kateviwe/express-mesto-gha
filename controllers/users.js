// Файл контроллеров

const { IncorrectInputError, NotFoundError } = require('../errors/errors');
// Импортируем модель 'user'
const User = require('../models/user');

const ERROR_CODE = 500;
// Данные для обработки ошибок
const incorrectInputError = new IncorrectInputError('Некорректные входные данные');
const notFoundError = new NotFoundError('Запрашиваемый пользователь не найден');

module.exports.getAllUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => {
      return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
    });
};

module.exports.getNecessaryUser = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'NotFoundError') {
        // 404
        return res.status(notFoundError.statusCode).send(notFoundError.message);
      } else {
        return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.postNewUser = (req, res) => {
  // Получим из объекта запроса имя, характеристику и аватар пользователя
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'IncorrectInputError') {
        // 400
        return res.status(incorrectInputError.statusCode).send(incorrectInputError.message);
      } else {
        return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.patchUserInfo = (req, res) => {
  // Получим из объекта запроса имя и характеристику пользователя
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, {
    name,
    about
  }, { new: true })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'IncorrectInputError') {
        // 400
        return res.status(incorrectInputError.statusCode).send(incorrectInputError.message);
      } else if (err.name === 'NotFoundError') {
        // 404
        return res.status(notFoundError.statusCode).send(notFoundError.message);
      } else {
        return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.patchUserAvatar = (req, res) => {
  // Получим из объекта запроса аватар пользователя
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, {
    avatar
  }, { new: true })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'IncorrectInputError') {
        // 400
        return res.status(incorrectInputError.statusCode).send(incorrectInputError.message);
      } else if (err.name === 'NotFoundError') {
        // 404
        return res.status(notFoundError.statusCode).send(notFoundError.message);
      } else {
        return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
      }
    });
};
