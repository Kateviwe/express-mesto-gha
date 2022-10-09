// Файл контроллеров
// Импортируем модуль для хеширования пароля перед сохранением в базу данных
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;

const { IncorrectInputError } = require('../errors/incorrect-input-error');
const { NotFoundError } = require('../errors/not-found-error');
const { BadRequestError } = require('../errors/bad-request');
const { UserDuplicationError } = require('../errors/user-duplication-error');
const { NotAuth } = require('../errors/not-auth-error');

// Импортируем модель 'user'
const User = require('../models/user');

module.exports.getAllUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

module.exports.getNecessaryUser = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new NotFoundError('Запрашиваемый пользователь не найден'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        // 400
        next(new BadRequestError('Некорректный id пользователя'));
      } else {
        next(err);
      }
    });
};

module.exports.postNewUser = (req, res, next) => {
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
        return Promise.reject(new UserDuplicationError('Пользователь с таким email уже существует'));
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
              res.send({
                name, about, avatar, email, _id: user._id,
              });
            })
            .catch((err) => {
              // ValidationError - ошибка валидации в mongoose
              // Валидация делается автоматически по схеме в папке models
              if (err.name === 'ValidationError') {
                // 400
                next(new IncorrectInputError(`Некорректные входные данные. ${err}`));
              } else {
                next(err);
              }
            });
        });
    })
    .catch((err) => {
      if (err.name === 'ConflictError') {
        // 409
        next(new UserDuplicationError('Пользователь с таким email уже существует'));
      } else {
        next(err);
      }
    });
};

module.exports.patchUserInfo = (req, res, next) => {
  // Получим из объекта запроса имя и характеристику пользователя
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, {
    name,
    about,
  }, { new: true, runValidators: true })
    .orFail(new NotFoundError('Запрашиваемый пользователь не найден'))
  // Особенность mongoose: при сохранении данных (POST) валидация происходит автоматически, а
  // при обновлении (PATCH) для валидации надо добавлять вручную опцию: runValidators: true
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        // 400
        next(new IncorrectInputError(`Некорректные входные данные. ${err}`));
      } else {
        next(err);
      }
    });
};

module.exports.patchUserAvatar = (req, res, next) => {
  // Получим из объекта запроса аватар пользователя
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, {
    avatar,
  }, { new: true, runValidators: true })
    .orFail(new NotFoundError('Запрашиваемый пользователь не найден'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        // 400
        next(new IncorrectInputError(`Некорректные входные данные. ${err}`));
      } else {
        next(err);
      }
    });
};

// Чтобы войти в систему, пользователь отправляет на сервер почту и пароль
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      // Создадим токен методом sign
      // Первый аргумент: пейлоуд токена — зашифрованный в строку объект пользователя
      // id достаточно, чтобы однозначно определить пользователя
      // expiresIn - время, в течение которого токен остаётся действительным
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res.send({ email });
      // Запишем токен в куки, и опцией maxAge определим время хранения куки: 7 дней
      // 'httpOnly: true' - доступ из JavaScript запрещен
      // 'sameSite: true' - защита от автоматической отправки кук
      // Указываем браузеру, чтобы он посылал куки только, если запрос сделан с того же домена
      return res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      })
        .end();
    })
    .catch((err) => {
      if (err.name === 'NotAuthorised') {
        // 401
        next(new NotAuth('Ошибка аутентификации'));
      } else {
        next(err);
      }
    });
};

module.exports.getInfoAboutMe = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new NotFoundError('Запрашиваемый пользователь не найден'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        // 400
        next(new BadRequestError('Некорректный id пользователя'));
      } else {
        next(err);
      }
    });
};
