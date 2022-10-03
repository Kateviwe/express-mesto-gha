const express = require('express');
const mongoose = require('mongoose');
// Подключим мидлвэр body-parser для объединения всех пакетов на принимающей стороне
const bodyParser = require('body-parser');

// Импорт роутеров
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');

const {
  postNewUser,
  login,
} = require('./controllers/users');

const { NotFoundError } = require('./errors/not-found-error');

const { PORT = 3000 } = process.env;

// Создадим приложение методом express()
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb');

const NotFound = new NotFoundError('Запрашиваемый ресурс не найден');

// Временное решение авторизации: добавляет в каждый запрос объект 'user'
app.use((req, res, next) => {
  req.user = {
    _id: '632c9b45f5c045c9bd7a39af',
  };

  next();
});

app.use('/users', usersRouter);
app.use('/cards', cardsRouter);
app.post('/signup', postNewUser);
app.post('/signin', login);

// Обработка несуществующих роутов
// 404
app.use('*', (req, res) => res.status(NotFound.statusCode).send({ message: NotFound.message }));

app.listen(PORT);
