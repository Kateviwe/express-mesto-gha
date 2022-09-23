// Файл контроллеров

const { IncorrectInputError } = require('../errors/incorrect-input-error');
const { NotFoundError } = require('../errors/not-found-error');
// Импортируем модель 'user'
const User = require('../models/user');

const ERROR_CODE = 500;
// Данные для обработки ошибок
const CastError = new NotFoundError('Запрашиваемый пользователь не найден');

module.exports.getAllUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(() => {
      return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
    });
};

module.exports.getNecessaryUser = (req, res) => {
  User.findById(req.params.userId)
    .orFail(() => new IncorrectInputError(`Некорректный id. ${err}`))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const ValidationError = new IncorrectInputError(`Некорректный id. ${err}`);
        // 400
        return res.status(ValidationError.statusCode).send({ message: ValidationError.message });
      } else if (err.name === 'CastError') {
        // 404
        return res.status(CastError.statusCode).send({ message: CastError.message });
      } else {
        return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
      }
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
      // ValidationError - ошибка валидации в mongoose (валидация делается автоматически по схеме в папке models)
      if (err.name === 'ValidationError') {
        const ValidationError = new IncorrectInputError(`Некорректные входные данные. ${err}`);
        // 400
        return res.status(ValidationError.statusCode).send({ message: ValidationError.message });
      } else {
        return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.patchUserInfo = (req, res) => {
  // Получим из объекта запроса имя и характеристику пользователя
  const { name, about } = req.body;

  if (!name && !about) {
    const ValidationError = new IncorrectInputError(`Поля "name" и "about" не могут быть пустыми одновременно`);
    return res.status(ValidationError.statusCode).send(ValidationError.message);
  }

  User.findByIdAndUpdate(req.user._id, {
    name,
    about,
  }, { new: true, runValidators: true })
    .orFail(() => CastError)
  // Особенность mongoose: при сохранении данных (POST) валидация происходит автоматически, а
  // при обновлении (PATCH) для валидации надо добавлять вручную опцию: runValidators: true
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const ValidationError = new IncorrectInputError(`Некорректные входные данные. ${err}`);
        // 400
        return res.status(ValidationError.statusCode).send({ message: ValidationError.message });
      } else if (err.name === 'CastError') {
        // 404
        return res.status(CastError.statusCode).send({ message: CastError.message });
      } else {
        return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.patchUserAvatar = (req, res) => {
  // Получим из объекта запроса аватар пользователя
  const { avatar } = req.body;

  if (!avatar) {
    const ValidationError = new IncorrectInputError(`Поле "avatar" не может быть пустым`);
    return res.status(ValidationError.statusCode).send(ValidationError.message);
  }

  User.findByIdAndUpdate(req.user._id, {
    avatar,
  }, { new: true, runValidators: true })
    .orFail(() => CastError)
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const ValidationError = new IncorrectInputError(`Некорректные входные данные. ${err}`);
        // 400
        return res.status(ValidationError.statusCode).send({ message: ValidationError.message });
      } else if (err.name === 'CastError') {
        // 404
        return res.status(CastError.statusCode).send({ message: CastError.message });
      } else {
        return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
      }
    });
};
