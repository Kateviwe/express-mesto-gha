require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
// Подключим модуль body-parser для объединения всех пакетов на принимающей стороне
const bodyParser = require('body-parser');
// Подключим модуль cookie-parser для извлечения данных из заголовка Cookie (чтение куки на сервере)
// и преобразования строки в объект
const cookieParser = require('cookie-parser');
// Подключим обработчик ошибок celebrate
const { errors } = require('celebrate');

// Импорт роутеров
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');

const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');

const {
  postNewUser,
  login,
} = require('./controllers/users');

const {
  postNewUserValidation,
  loginValidation,
} = require('./middlewares/validation');

const { NotFoundError } = require('./errors/not-found-error');

const { PORT = 3000 } = process.env;

// Создадим приложение методом express()
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Подключим, и куки станут доступны в объекте req.cookies.jwt
app.use(cookieParser());

// Подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb');

// Роуты без авторизации
app.post('/signup', postNewUserValidation, postNewUser);
app.post('/signin', loginValidation, login);

// Роуты с авторизацией
app.use(auth);
app.use('/users', usersRouter);
app.use('/cards', cardsRouter);

// Обработка несуществующих роутов
// 404
app.use('*', (req, res, next) => next(new NotFoundError('Запрашиваемый ресурс не найден')));

// Обработчик ошибок, возникших при валидации данных с помощью библиотеки Joi
// Будет обрабатывать только ошибки, которые сгенерировал celebrate
// 400 (Bad Request)
app.use(errors());
// Централизованный обработчик ошибок
// Перехватит все остальные ошибки
app.use(errorHandler);

app.listen(PORT);
