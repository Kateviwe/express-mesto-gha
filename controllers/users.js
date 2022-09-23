// Файл контроллеров

const { IncorrectInputError } = require('../errors/incorrect-input-error');
const { NotFoundError } = require('../errors/not-found-error');
const { BadRequestError } = require('../errors/bad-request');
// Импортируем модель 'user'
const User = require('../models/user');

const ERROR_CODE = 500;
// Данные для обработки ошибок
const NotFound = new NotFoundError('Запрашиваемый пользователь не найден');
const CastError = new BadRequestError('Некорректный id пользователя');

module.exports.getAllUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(() => res.status(ERROR_CODE).send({ message: 'Произошла ошибка' }));
};

module.exports.getNecessaryUser = (req, res) => {
  User.findById(req.params.userId)
    .orFail(() => NotFound)
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        // 400
        return res.status(CastError.statusCode).send({ message: CastError.message });
      }
      if (err.name === 'NotFoundError') {
        // 404
        return res.status(NotFound.statusCode).send({ message: NotFound.message });
      }
      return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
    });
};

module.exports.postNewUser = (req, res) => {
  // Получим из объекта запроса имя, характеристику и аватар пользователя
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      // ValidationError - ошибка валидации в mongoose
      // Валидация делается автоматически по схеме в папке models
      if (err.name === 'ValidationError') {
        const ValidationError = new IncorrectInputError(`Некорректные входные данные. ${err}`);
        // 400
        return res.status(ValidationError.statusCode).send({ message: ValidationError.message });
      }
      return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
    });
};

module.exports.patchUserInfo = (req, res) => {
  // Получим из объекта запроса имя и характеристику пользователя
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, {
    name,
    about,
  }, { new: true, runValidators: true })
    .orFail(() => NotFound)
  // Особенность mongoose: при сохранении данных (POST) валидация происходит автоматически, а
  // при обновлении (PATCH) для валидации надо добавлять вручную опцию: runValidators: true
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const ValidationError = new IncorrectInputError(`Некорректные входные данные. ${err}`);
        // 400
        return res.status(ValidationError.statusCode).send({ message: ValidationError.message });
      }
      if (err.name === 'NotFoundError') {
        // 404
        return res.status(NotFound.statusCode).send({ message: NotFound.message });
      }
      return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
    });
};

module.exports.patchUserAvatar = (req, res) => {
  // Получим из объекта запроса аватар пользователя
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, {
    avatar,
  }, { new: true, runValidators: true })
    .orFail(() => NotFound)
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const ValidationError = new IncorrectInputError(`Некорректные входные данные. ${err}`);
        // 400
        return res.status(ValidationError.statusCode).send({ message: ValidationError.message });
      }
      if (err.name === 'NotFoundError') {
        // 404
        return res.status(NotFound.statusCode).send({ message: NotFound.message });
      }
      return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
    });
};
