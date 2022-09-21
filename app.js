const express = require('express');
const mongoose = require('mongoose');
// Подключим мидлвэр body-parser для объединения всех пакетов на принимающей стороне
const bodyParser = require('body-parser');

// Импорт роутеров
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');

const { PORT = 3000 } = process.env;

// Создадим приложение методом express()
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb');

// Временное решение авторизации: добавляет в каждый запрос объект 'user'
app.use((req, res, next) => {
  req.user = {
    _id: '6329b3ed83647e2a2922344a',
  };

  next();
});

app.use('/users', usersRouter);
app.use('/cards', cardsRouter);

app.listen(PORT, () => {
  console.log(`${PORT}`);
});
