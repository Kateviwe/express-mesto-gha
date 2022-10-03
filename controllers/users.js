// Файл контроллеров

// Импортируем модуль для хеширования пароля перед сохранением в базу данных
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { IncorrectInputError } = require('../errors/incorrect-input-error');
const { NotFoundError } = require('../errors/not-found-error');
const { BadRequestError } = require('../errors/bad-request');
const { UserDuplicationError } = require('../errors/user-duplication-error');
const { NotAuth } = require('../errors/not-auth-error');

// Импортируем модель 'user'
const User = require('../models/user');

const ERROR_CODE = 500;
// Данные для обработки ошибок
const NotFound = new NotFoundError('Запрашиваемый пользователь не найден');
const CastError = new BadRequestError('Некорректный id пользователя');
const ConflictError = new UserDuplicationError('Пользователь с таким email уже существует');
const NotAuthorised = new NotAuth('Ошибка аутентификации');

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
  // Получим из объекта запроса имя, характеристику, аватар пользователя, email и пароль
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  // Проверим, может пользователь с таким Email уже существует
  User.find({ email })
    .then((userArray) => {
      // Даже если такой пользователь не существует, нам вернется пустой массив
      // Проверим длину массива, чтобы понять, нашелся ли такой пользователь
      if (userArray.length > 0) {
        // Отклоняем промис и перебрасываем на catch
        return Promise.reject(ConflictError);
      }
      // Применим метод hash для хеширования пароля пользователя
      bcrypt.hash(password, 10)
        .then((hash) => {
          User.create({
            name,
            about,
            avatar,
            email,
            password: hash,
          })
            .then((user) => {
              res.send(user);
            })
            .catch((err) => {
              // ValidationError - ошибка валидации в mongoose
              // Валидация делается автоматически по схеме в папке models
              if (err.name === 'ValidationError') {
                const ValidationError = new IncorrectInputError(`Некорректные входные данные. ${err}`);
                // 400
                return res.status(ValidationError.statusCode)
                  .send({ message: ValidationError.message });
              }
              return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
            });
        });
    })
    .catch((err) => {
      if (err.name === 'ConflictError') {
        // 409
        return res.status(ConflictError.statusCode)
          .send({ message: ConflictError.message });
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

// Чтобы войти в систему, пользователь отправляет на сервер почту и пароль
module.exports.login = (req, res) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      // Создадим токен методом sign
      // Первый аргумент: пейлоуд токена — зашифрованный в строку объект пользователя
      // id достаточно, чтобы однозначно определить пользователя
      // expiresIn - время, в течение которого токен остаётся действительным
      const token = jwt.sign({ _id: user._id }, 'kflkmhelvhmekurvweb34twhuiohw445y78', { expiresIn: '7d' });
      return res.send({ token });
    })
    .catch((err) => {
      if (err.name === 'NotAuthorised') {
        // 401
        return res.status(NotAuthorised.statusCode).send({ message: NotAuthorised.message });
      }
      return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
    });
};
